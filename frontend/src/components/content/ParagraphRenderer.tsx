import type { ReadmeContent } from "../../types/readme";
import { InlineMarkdown } from "./InlineMarkdown";

export function ParagraphRenderer({ block }: { block: ReadmeContent }) {
  const source = block.rawMarkdown ?? block.text ?? block.markdown ?? block.content ?? "";
  if (!source) return null;
  return (
    <div className="text-[15px] leading-7 text-slate-300">
      <InlineMarkdown>{source}</InlineMarkdown>
    </div>
  );
}
