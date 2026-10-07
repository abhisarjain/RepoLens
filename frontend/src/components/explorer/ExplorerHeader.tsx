import { ArrowLeft, GitFork, Orbit, RefreshCw } from "lucide-react";
import { useRef, type RefObject } from "react";
import type { Project } from "../../types/project";
import type { ReadmeNode } from "../../types/readme";
import type { SearchResult } from "../../utils/searchReadme";
import type { ExplorerMode } from "../graph/ReadmeGraph";
import { RepoLensLogo } from "../ui/RepoLensLogo";
import { Breadcrumbs } from "./Breadcrumbs";
import { DepthIndicator } from "./DepthIndicator";
import { SearchBox, type SearchBoxHandle } from "./SearchBox";

interface ExplorerHeaderProps {
  project: Project;
  mode: ExplorerMode;
  onModeChange: (mode: ExplorerMode) => void;
  path: ReadmeNode[];
  canGoBack: boolean;
  onBack: () => void;
  onNavigate: (id: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  searchResults: SearchResult[];
  searchRef: RefObject<SearchBoxHandle>;
  onReplace?: (file: File) => Promise<void>;
  replacing?: boolean;
}

export function ExplorerHeader({
  project,
  mode,
  onModeChange,
  path,
  canGoBack,
  onBack,
  onNavigate,
  query,
  onQueryChange,
  searchResults,
  searchRef,
  onReplace,
  replacing,
}: ExplorerHeaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <header className="relative z-40 shrink-0 border-b border-white/[0.08] bg-ink-950/95 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3 lg:w-[245px]">
          <RepoLensLogo compact />
          <div className="min-w-0 border-l border-white/[0.08] pl-3">
            <div className="truncate text-[12px] font-medium text-slate-200" title={project.name}>
              {project.name}
            </div>
            <div className="truncate font-mono text-[9px] text-slate-600" title={project.fileName}>
              {project.fileName}
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center sm:flex">
          <SearchBox
            ref={searchRef}
            query={query}
            onQueryChange={onQueryChange}
            results={searchResults}
            onSelect={onNavigate}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {onReplace ? (
            <>
              <input
                ref={fileRef}
                type="file"
                accept=".md,.markdown,text/markdown,text/plain"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void onReplace(file);
                  event.currentTarget.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={replacing}
                className="hidden h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 text-[11px] text-slate-500 transition-colors hover:border-white/[0.14] hover:text-slate-200 disabled:opacity-50 xl:flex"
                title="Replace this project's README"
              >
                <RefreshCw size={12} className={replacing ? "animate-spin" : ""} />
                {replacing ? "Parsing…" : "Replace"}
              </button>
            </>
          ) : null}
          <div className="flex h-9 items-center rounded-lg border border-white/[0.09] bg-black/20 p-1">
            <button
              type="button"
              onClick={() => onModeChange("focus")}
              className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] transition-colors ${
                mode === "focus"
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              aria-pressed={mode === "focus"}
            >
              <Orbit size={13} /> <span className="hidden xs:inline">Focus</span>
            </button>
            <button
              type="button"
              onClick={() => onModeChange("full")}
              className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] transition-colors ${
                mode === "full"
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              aria-pressed={mode === "full"}
            >
              <GitFork size={13} /> <span className="hidden xs:inline">Full map</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-10 items-center gap-2 border-t border-white/[0.045] px-3 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-[11px] text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-200 disabled:pointer-events-none disabled:opacity-25"
          title="Go to parent (Esc)"
        >
          <ArrowLeft size={13} /> <span className="hidden sm:inline">Back</span>
          <kbd className="ml-1 hidden rounded border border-white/[0.08] px-1 font-mono text-[8px] text-slate-700 lg:inline">ESC</kbd>
        </button>
        <span className="h-4 w-px shrink-0 bg-white/[0.07]" />
        <div className="min-w-0 flex-1 overflow-hidden">
          <Breadcrumbs path={path} fileName={project.fileName} onNavigate={onNavigate} />
        </div>
        <div className="hidden shrink-0 md:block">
          <DepthIndicator depth={Math.max(0, path.length - 1)} />
        </div>
      </div>

      <div className="border-t border-white/[0.045] px-3 py-2 sm:hidden">
        <SearchBox
          ref={searchRef}
          query={query}
          onQueryChange={onQueryChange}
          results={searchResults}
          onSelect={onNavigate}
        />
      </div>
    </header>
  );
}
