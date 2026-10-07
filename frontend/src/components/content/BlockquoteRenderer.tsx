import { Quote } from "lucide-react";
import type { ReadmeContent } from "../../types/readme";
import { InlineMarkdown } from "./InlineMarkdown";

export function BlockquoteRenderer({ block }: { block: ReadmeContent }) {
  const source = (block.text ?? block.rawMarkdown ?? "").replace(/^>\s?/gm, "");
  return (
    <blockquote className="relative rounded-r-xl border-l-2 border-lens-400/70 bg-lens-400/[0.045] py-3 pl-10 pr-4 text-[14px] italic leading-6 text-slate-300">
      <Quote className="absolute left-3 top-3.5 text-lens-400/60" size={17} />
      <InlineMarkdown>{source}</InlineMarkdown>
    </blockquote>
  );
}
