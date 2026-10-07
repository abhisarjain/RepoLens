package com.repolens.service;

import com.repolens.dto.ReadmeContentDto;
import com.repolens.dto.ReadmeDocumentDto;
import com.repolens.dto.ReadmeNodeDto;
import com.repolens.service.model.ParsedMarkdown;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MarkdownPipelineTest {

    private MarkdownParserService parser;
    private HeadingTreeBuilder treeBuilder;

    @BeforeEach
    void setUp() {
        parser = new MarkdownParserService();
        treeBuilder = new HeadingTreeBuilder();
    }

    @Test
    void buildsHierarchyAndAssociatesContentOnlyWithItsOwningHeading() {
        ReadmeDocumentDto document = parse("""
                # Root

                Root text.

                ## Alpha

                Alpha text.

                ### Alpha Child

                Child content.

                ## Beta

                Beta content.

                #### Deep Beta

                Deep content.

                ## Alpha

                Second Alpha content.
                """);

        assertThat(document.roots()).hasSize(1);
        ReadmeNodeDto root = document.roots().getFirst();
        assertThat(root.title()).isEqualTo("Root");
        assertThat(root.content()).extracting(ReadmeContentDto::text).containsExactly("Root text.");
        assertThat(root.children()).extracting(ReadmeNodeDto::title)
                .containsExactly("Alpha", "Beta", "Alpha");

        ReadmeNodeDto firstAlpha = root.children().get(0);
        ReadmeNodeDto beta = root.children().get(1);
        ReadmeNodeDto secondAlpha = root.children().get(2);

        assertThat(firstAlpha.id()).isNotEqualTo(secondAlpha.id());
        assertThat(firstAlpha.content()).extracting(ReadmeContentDto::text).containsExactly("Alpha text.");
        assertThat(firstAlpha.children()).extracting(ReadmeNodeDto::title).containsExactly("Alpha Child");
        assertThat(firstAlpha.children().getFirst().content())
                .extracting(ReadmeContentDto::text)
                .containsExactly("Child content.");
        assertThat(beta.content()).extracting(ReadmeContentDto::text).containsExactly("Beta content.");
        assertThat(beta.children()).extracting(ReadmeNodeDto::title).containsExactly("Deep Beta");
        assertThat(beta.children().getFirst().level()).isEqualTo(4);
        assertThat(secondAlpha.content()).extracting(ReadmeContentDto::text)
                .containsExactly("Second Alpha content.");
    }

    @Test
    void supportsSkippedHeadingLevelsWithoutChangingSourceLevels() {
        ReadmeDocumentDto document = parse("""
                # Project
                ### Backend
                ##### Authentication
                ## Frontend
                """);

        ReadmeNodeDto project = document.roots().getFirst();
        assertThat(project.children()).extracting(ReadmeNodeDto::title)
                .containsExactly("Backend", "Frontend");
        assertThat(project.children().getFirst().level()).isEqualTo(3);
        assertThat(project.children().getFirst().children().getFirst().title())
                .isEqualTo("Authentication");
        assertThat(project.children().getFirst().children().getFirst().level()).isEqualTo(5);
    }

    @Test
    void keepsMultipleH1HeadingsAsVisibleRoots() {
        ReadmeDocumentDto document = parse("""
                # Client
                Client text.
                # Server
                Server text.
                """);

        assertThat(document.roots()).extracting(ReadmeNodeDto::title)
                .containsExactly("Client", "Server");
    }

    @Test
    void usesTopmostAvailableHeadingsWhenThereIsNoH1() {
        ReadmeDocumentDto document = parse("""
                ## Backend
                ### APIs
                ## Frontend
                """);

        assertThat(document.roots()).extracting(ReadmeNodeDto::title)
                .containsExactly("Backend", "Frontend");
        assertThat(document.roots().getFirst().children())
                .extracting(ReadmeNodeDto::title)
                .containsExactly("APIs");
    }

    @Test
    void retainsPreambleAndHeadinglessContentWithoutInventingANode() {
        ReadmeDocumentDto headingless = parse("""
                A paragraph before any headings.

                - one
                - two
                """);

        assertThat(headingless.hasHeadings()).isFalse();
        assertThat(headingless.roots()).isEmpty();
        assertThat(headingless.content()).extracting(ReadmeContentDto::type)
                .containsExactly("paragraph", "unordered-list");

        ReadmeDocumentDto withPreamble = parse("""
                Intro that is not owned by a heading.

                # Root

                Root content.
                """);
        assertThat(withPreamble.content()).extracting(ReadmeContentDto::text)
                .containsExactly("Intro that is not owned by a heading.");
        assertThat(withPreamble.roots().getFirst().content())
                .extracting(ReadmeContentDto::text)
                .containsExactly("Root content.");
    }

    @Test
    void emptyMarkdownProducesAnEmptyDocumentModel() {
        ReadmeDocumentDto document = parse("");

        assertThat(document.roots()).isEmpty();
        assertThat(document.content()).isEmpty();
        assertThat(document.hasHeadings()).isFalse();
    }

    @Test
    void normalizesSupportedBlocksWhileRetainingTheirSource() {
        ReadmeDocumentDto document = parse("""
                # Blocks

                Text with `code` and a [link](https://example.com).

                > quoted words

                ---

                - outer
                  1. nested one
                  2. nested two

                ```java
                int answer = 42;
                ```

                    indented();

                | Name | Value |
                | --- | --- |
                | Alpha | One |

                ![Example image](https://example.com/image.png "Preview")
                """);

        List<ReadmeContentDto> content = document.roots().getFirst().content();
        assertThat(content).extracting(ReadmeContentDto::type).containsExactly(
                "paragraph",
                "blockquote",
                "horizontal-rule",
                "unordered-list",
                "code",
                "code",
                "table",
                "image"
        );

        ReadmeContentDto paragraph = content.getFirst();
        assertThat(paragraph.rawMarkdown()).contains("`code`");
        assertThat(paragraph.inlines()).extracting(inline -> inline.type())
                .contains("inline-code", "link");

        ReadmeContentDto list = content.get(3);
        assertThat(list.list().ordered()).isFalse();
        assertThat(list.list().items().getFirst().children()).hasSize(1);
        assertThat(list.list().items().getFirst().children().getFirst().ordered()).isTrue();

        ReadmeContentDto fencedCode = content.get(4);
        assertThat(fencedCode.language()).isEqualTo("java");
        assertThat(fencedCode.text()).contains("int answer = 42;");

        ReadmeContentDto table = content.get(6);
        assertThat(table.headers()).containsExactly("Name", "Value");
        assertThat(table.rows()).containsExactly(List.of("Alpha", "One"));

        ReadmeContentDto image = content.get(7);
        assertThat(image.url()).isEqualTo("https://example.com/image.png");
        assertThat(image.alt()).isEqualTo("Example image");
        assertThat(image.title()).isEqualTo("Preview");
    }

    private ReadmeDocumentDto parse(String markdown) {
        ParsedMarkdown parsed = parser.parse(markdown);
        return treeBuilder.build("README.md", parsed);
    }
}
