package com.repolens.service;

import com.repolens.dto.ReadmeContentDto;
import com.repolens.dto.ReadmeInlineDto;
import com.repolens.dto.ReadmeListDto;
import com.repolens.dto.ReadmeListItemDto;
import com.repolens.exception.InvalidMarkdownException;
import com.repolens.service.model.ParsedHeading;
import com.repolens.service.model.ParsedMarkdown;
import com.vladsch.flexmark.ast.BlockQuote;
import com.vladsch.flexmark.ast.BulletList;
import com.vladsch.flexmark.ast.Code;
import com.vladsch.flexmark.ast.Emphasis;
import com.vladsch.flexmark.ast.FencedCodeBlock;
import com.vladsch.flexmark.ast.HardLineBreak;
import com.vladsch.flexmark.ast.Heading;
import com.vladsch.flexmark.ast.Image;
import com.vladsch.flexmark.ast.IndentedCodeBlock;
import com.vladsch.flexmark.ast.Link;
import com.vladsch.flexmark.ast.ListBlock;
import com.vladsch.flexmark.ast.ListItem;
import com.vladsch.flexmark.ast.OrderedList;
import com.vladsch.flexmark.ast.Paragraph;
import com.vladsch.flexmark.ast.SoftLineBreak;
import com.vladsch.flexmark.ast.StrongEmphasis;
import com.vladsch.flexmark.ast.Text;
import com.vladsch.flexmark.ast.ThematicBreak;
import com.vladsch.flexmark.ast.util.TextCollectingVisitor;
import com.vladsch.flexmark.ext.tables.TableBlock;
import com.vladsch.flexmark.ext.tables.TableBody;
import com.vladsch.flexmark.ext.tables.TableCell;
import com.vladsch.flexmark.ext.tables.TableHead;
import com.vladsch.flexmark.ext.tables.TableRow;
import com.vladsch.flexmark.ext.tables.TablesExtension;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Node;
import com.vladsch.flexmark.util.data.MutableDataSet;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class MarkdownParserService {

    private final Parser parser;

    public MarkdownParserService() {
        MutableDataSet options = new MutableDataSet();
        options.set(Parser.EXTENSIONS, List.of(TablesExtension.create()));
        this.parser = Parser.builder(options).build();
    }

    public ParsedMarkdown parse(String markdown) {
        if (markdown == null) {
            throw new InvalidMarkdownException("Markdown content is required");
        }

        try {
            Node document = parser.parse(markdown);
            List<ParsedHeading> headings = new ArrayList<>();
            List<ReadmeContentDto> documentContent = new ArrayList<>();
            List<ReadmeContentDto> currentContent = documentContent;

            for (Node block = document.getFirstChild(); block != null; block = block.getNext()) {
                if (block instanceof Heading heading) {
                    currentContent = new ArrayList<>();
                    headings.add(new ParsedHeading(
                            plainText(heading),
                            heading.getLevel(),
                            currentContent
                    ));
                    continue;
                }

                ReadmeContentDto parsedBlock = parseBlock(block);
                if (parsedBlock != null) {
                    currentContent.add(parsedBlock);
                }
            }

            return new ParsedMarkdown(List.copyOf(headings), List.copyOf(documentContent));
        } catch (InvalidMarkdownException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new InvalidMarkdownException("The Markdown document could not be parsed", exception);
        }
    }

    private ReadmeContentDto parseBlock(Node block) {
        String raw = block.getChars().toString();

        if (block instanceof FencedCodeBlock codeBlock) {
            return content(
                    "code",
                    raw,
                    codeBlock.getContentChars().toString(),
                    firstWord(codeBlock.getInfo().toString()),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            );
        }
        if (block instanceof IndentedCodeBlock codeBlock) {
            return content(
                    "code",
                    raw,
                    codeBlock.getContentChars().toString(),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            );
        }
        if (block instanceof BulletList || block instanceof OrderedList) {
            ReadmeListDto list = parseList((ListBlock) block);
            return content(
                    list.ordered() ? "ordered-list" : "unordered-list",
                    raw,
                    plainText(block),
                    null,
                    null,
                    null,
                    null,
                    null,
                    list,
                    null,
                    null
            );
        }
        if (block instanceof BlockQuote) {
            return content(
                    "blockquote",
                    raw,
                    plainText(block),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            );
        }
        if (block instanceof TableBlock tableBlock) {
            return parseTable(tableBlock, raw);
        }
        if (block instanceof ThematicBreak) {
            return content(
                    "horizontal-rule",
                    raw,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            );
        }
        if (block instanceof Paragraph paragraph) {
            return parseParagraph(paragraph, raw);
        }

        // Unknown block extensions remain lossless through rawMarkdown.
        return content(
                "paragraph",
                raw,
                plainText(block),
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }

    private ReadmeContentDto parseParagraph(Paragraph paragraph, String raw) {
        Node onlyChild = singleMeaningfulChild(paragraph);
        if (onlyChild instanceof Image image) {
            return content(
                    "image",
                    raw,
                    plainText(image),
                    null,
                    image.getUrl().toString(),
                    plainText(image),
                    emptyToNull(image.getTitle().toString()),
                    List.of(parseInline(image)),
                    null,
                    null,
                    null
            );
        }
        if (onlyChild instanceof Link link) {
            return content(
                    "link",
                    raw,
                    plainText(link),
                    null,
                    link.getUrl().toString(),
                    null,
                    emptyToNull(link.getTitle().toString()),
                    List.of(parseInline(link)),
                    null,
                    null,
                    null
            );
        }

        return content(
                "paragraph",
                raw,
                plainText(paragraph),
                null,
                null,
                null,
                null,
                parseInlines(paragraph),
                null,
                null,
                null
        );
    }

    private List<ReadmeInlineDto> parseInlines(Paragraph paragraph) {
        List<ReadmeInlineDto> inlines = new ArrayList<>();
        for (Node child = paragraph.getFirstChild(); child != null; child = child.getNext()) {
            inlines.add(parseInline(child));
        }
        return List.copyOf(inlines);
    }

    private ReadmeInlineDto parseInline(Node inline) {
        String type = "text";
        String text = plainText(inline);
        String url = null;
        String alt = null;
        String title = null;

        if (inline instanceof Code code) {
            type = "inline-code";
            text = code.getText().toString();
        } else if (inline instanceof Image image) {
            type = "image";
            url = image.getUrl().toString();
            alt = plainText(image);
            title = emptyToNull(image.getTitle().toString());
        } else if (inline instanceof Link link) {
            type = "link";
            url = link.getUrl().toString();
            title = emptyToNull(link.getTitle().toString());
        } else if (inline instanceof StrongEmphasis) {
            type = "strong";
        } else if (inline instanceof Emphasis) {
            type = "emphasis";
        } else if (inline instanceof SoftLineBreak || inline instanceof HardLineBreak) {
            type = "line-break";
            text = "\n";
        } else if (inline instanceof Text) {
            type = "text";
        }

        return new ReadmeInlineDto(
                type,
                inline.getChars().toString(),
                text,
                url,
                alt,
                title
        );
    }

    private ReadmeListDto parseList(ListBlock listBlock) {
        boolean ordered = listBlock instanceof OrderedList;
        Integer start = ordered ? ((OrderedList) listBlock).getStartNumber() : null;
        List<ReadmeListItemDto> items = new ArrayList<>();

        for (Node child = listBlock.getFirstChild(); child != null; child = child.getNext()) {
            if (!(child instanceof ListItem item)) {
                continue;
            }

            List<ReadmeListDto> nestedLists = new ArrayList<>();
            List<String> ownText = new ArrayList<>();
            for (Node itemChild = item.getFirstChild(); itemChild != null; itemChild = itemChild.getNext()) {
                if (itemChild instanceof ListBlock nested) {
                    nestedLists.add(parseList(nested));
                } else {
                    String value = plainText(itemChild);
                    if (!value.isBlank()) {
                        ownText.add(value);
                    }
                }
            }

            items.add(new ReadmeListItemDto(
                    item.getChars().toString(),
                    String.join("\n", ownText),
                    List.copyOf(nestedLists)
            ));
        }

        return new ReadmeListDto(ordered, start, List.copyOf(items));
    }

    private ReadmeContentDto parseTable(TableBlock table, String raw) {
        List<String> headers = new ArrayList<>();
        List<List<String>> rows = new ArrayList<>();

        for (Node section = table.getFirstChild(); section != null; section = section.getNext()) {
            if (section instanceof TableHead) {
                List<List<String>> headerRows = collectTableRows(section);
                if (!headerRows.isEmpty()) {
                    headers.addAll(headerRows.getFirst());
                    if (headerRows.size() > 1) {
                        rows.addAll(headerRows.subList(1, headerRows.size()));
                    }
                }
            } else if (section instanceof TableBody) {
                rows.addAll(collectTableRows(section));
            } else if (section instanceof TableRow row) {
                rows.add(extractTableRow(row));
            }
        }

        if (headers.isEmpty() && !rows.isEmpty()) {
            headers.addAll(rows.removeFirst());
        }

        return content(
                "table",
                raw,
                plainText(table),
                null,
                null,
                null,
                null,
                null,
                null,
                List.copyOf(headers),
                rows.stream().map(List::copyOf).toList()
        );
    }

    private List<List<String>> collectTableRows(Node section) {
        List<List<String>> rows = new ArrayList<>();
        for (Node child = section.getFirstChild(); child != null; child = child.getNext()) {
            if (child instanceof TableRow row) {
                rows.add(extractTableRow(row));
            }
        }
        return rows;
    }

    private List<String> extractTableRow(TableRow row) {
        List<String> cells = new ArrayList<>();
        for (Node child = row.getFirstChild(); child != null; child = child.getNext()) {
            if (child instanceof TableCell cell) {
                cells.add(plainText(cell));
            }
        }
        return cells;
    }

    private Node singleMeaningfulChild(Paragraph paragraph) {
        Node result = null;
        for (Node child = paragraph.getFirstChild(); child != null; child = child.getNext()) {
            if (child instanceof Text && child.getChars().toString().isBlank()) {
                continue;
            }
            if (result != null) {
                return null;
            }
            result = child;
        }
        return result;
    }

    private String plainText(Node node) {
        return new TextCollectingVisitor().collectAndGetText(node).trim();
    }

    private String firstWord(String value) {
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed.split("\\s+", 2)[0].toLowerCase(Locale.ROOT);
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private ReadmeContentDto content(
            String type,
            String rawMarkdown,
            String text,
            String language,
            String url,
            String alt,
            String title,
            List<ReadmeInlineDto> inlines,
            ReadmeListDto list,
            List<String> headers,
            List<List<String>> rows
    ) {
        return new ReadmeContentDto(
                type,
                rawMarkdown,
                text,
                language,
                url,
                alt,
                title,
                inlines,
                list,
                headers,
                rows
        );
    }
}
