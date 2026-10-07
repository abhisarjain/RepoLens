import { ExternalLink } from "lucide-react";
import type { ReadmeContent } from "../../types/readme";

export function LinkRenderer({ block }: { block: ReadmeContent }) {
  const href = block.url ?? block.href ?? "";
  const label = block.text ?? block.title ?? href;
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 text-sm text-slate-300 transition-colors hover:border-lens-400/30 hover:bg-lens-400/[0.04] hover:text-white"
    >
      <ExternalLink size={15} className="shrink-0 text-lens-400" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="truncate text-xs text-slate-600 group-hover:text-slate-500">{href}</span>
    </a>
  );
}
