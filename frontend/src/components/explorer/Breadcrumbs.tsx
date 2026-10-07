import { ChevronRight, Network } from "lucide-react";
import type { ReadmeNode } from "../../types/readme";

interface BreadcrumbsProps {
  path: ReadmeNode[];
  fileName: string;
  onNavigate: (id: string) => void;
}

export function Breadcrumbs({ path, fileName, onNavigate }: BreadcrumbsProps) {
  if (!path.length) {
    return (
      <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
        <Network size={13} />
        <span className="truncate">{fileName}</span>
        <ChevronRight size={12} className="shrink-0 text-slate-700" />
        <span className="truncate text-slate-400">No headings</span>
      </div>
    );
  }

  return (
    <nav className="flex min-w-0 items-center gap-1" aria-label="Heading breadcrumb">
      {path.map((node, index) => (
        <div key={node.id} className="flex min-w-0 items-center gap-1">
          {index > 0 ? <ChevronRight size={12} className="shrink-0 text-slate-700" /> : null}
          <button
            type="button"
            onClick={() => onNavigate(node.id)}
            className={`max-w-[190px] truncate rounded px-1.5 py-1 text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-lens-400 ${
              index === path.length - 1
                ? "text-slate-200"
                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
            }`}
            aria-current={index === path.length - 1 ? "page" : undefined}
            title={node.title}
          >
            {node.title}
          </button>
        </div>
      ))}
    </nav>
  );
}
