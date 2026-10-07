import type { ReadmeContent } from "../../types/readme";
import { BlockquoteRenderer } from "./BlockquoteRenderer";
import { CodeTerminal } from "./CodeTerminal";
import { ImageViewer } from "./ImageViewer";
import { LinkRenderer } from "./LinkRenderer";
import { ListRenderer } from "./ListRenderer";
import { ParagraphRenderer } from "./ParagraphRenderer";
import { TableRenderer } from "./TableRenderer";

export function ContentBlockRenderer({ block }: { block: ReadmeContent }) {
  switch (block.type.toLowerCase().replaceAll("_", "-")) {
    case "code":
    case "code-block":
    case "fenced-code":
    case "indented-code":
      return <CodeTerminal block={block} />;
    case "unordered-list":
    case "ordered-list":
    case "list":
      return <ListRenderer block={block} />;
    case "blockquote":
    case "block-quote":
      return <BlockquoteRenderer block={block} />;
    case "image":
      return <ImageViewer block={block} />;
    case "link":
      return <LinkRenderer block={block} />;
    case "table":
      return <TableRenderer block={block} />;
    case "horizontal-rule":
    case "thematic-break":
    case "hr":
      return <hr className="border-0 border-t border-white/[0.09]" />;
    case "paragraph":
    default:
      return <ParagraphRenderer block={block} />;
  }
}
