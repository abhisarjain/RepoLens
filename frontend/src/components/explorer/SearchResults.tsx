import { ArrowRight, FileText, Heading } from "lucide-react";
import type { SearchResult } from "../../utils/searchReadme";

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  onSelect: (nodeId: string) => void;
}

export function SearchResults({ query, results, onSelect }: SearchResultsProps) {
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-white/10 bg-[#10141d]/[0.98] shadow-[0_22px_70px_rgba(0,0,0,.5)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-600">
        <span>Local README search</span>
        <span>{results.length} match{results.length === 1 ? "" : "es"}</span>
      </div>
      {results.length ? (
        <div className="max-h-[370px] overflow-y-auto p-1.5">
          {results.map((result) => (
            <button
              key={result.node.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(result.node.id)}
              className="group flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-white/[0.05] focus:bg-white/[0.05] focus:outline-none"
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/[0.08] bg-white/[0.025] text-slate-500 group-hover:text-lens-300">
                {result.matchKind === "heading" ? <Heading size={12} /> : <FileText size={12} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-slate-200">
                  {result.node.title}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-slate-600">
                  {result.path.map((node) => node.title).join(" › ")}
                </span>
                {result.excerpt && result.excerpt !== result.node.title ? (
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {result.excerpt}
                  </span>
                ) : null}
              </span>
              <ArrowRight size={13} className="mt-1 shrink-0 text-slate-700 group-hover:text-lens-400" />
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 py-8 text-center text-sm text-slate-500">
          No literal matches for “{query}”.
        </div>
      )}
    </div>
  );
}
