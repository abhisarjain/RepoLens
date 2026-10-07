import { AlignLeft, ListTree } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { Project } from "../../types/project";
import {
  findNode,
  getNodePath,
  getParentNode,
} from "../../utils/readmeTree";
import { searchReadme } from "../../utils/searchReadme";
import { ReadmeGraph, type ExplorerMode } from "../graph/ReadmeGraph";
import { ContentPanel } from "./ContentPanel";
import { ExplorerHeader } from "./ExplorerHeader";
import { ReadmeOutline } from "./ReadmeOutline";
import type { SearchBoxHandle } from "./SearchBox";

interface ExplorerProps {
  project: Project;
  onReplace?: (file: File) => Promise<void>;
  replacing?: boolean;
}

type MobilePanel = "outline" | "content" | null;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

export function Explorer({ project, onReplace, replacing }: ExplorerProps) {
  const roots = project.document.roots;
  const [selectedId, setSelectedId] = useState<string | null>(roots[0]?.id ?? null);
  const [mode, setMode] = useState<ExplorerMode>("focus");
  const [query, setQuery] = useState("");
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const searchRef = useRef<SearchBoxHandle>(null);

  useEffect(() => {
    if (!selectedId || !findNode(roots, selectedId)) {
      setSelectedId(roots[0]?.id ?? null);
    }
  }, [roots, selectedId]);

  const current = useMemo(() => findNode(roots, selectedId), [roots, selectedId]);
  const parent = useMemo(() => getParentNode(roots, selectedId), [roots, selectedId]);
  const path = useMemo(() => getNodePath(roots, selectedId), [roots, selectedId]);
  const searchResults = useMemo(() => searchReadme(roots, query), [roots, query]);

  const navigate = useCallback((nodeId: string) => {
    setSelectedId(nodeId);
    setMode("focus");
    setMobilePanel(null);
  }, []);

  const goBack = useCallback(() => {
    if (parent) navigate(parent.id);
  }, [navigate, parent]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === "Escape") {
        if (mobilePanel) setMobilePanel(null);
        else if (parent) navigate(parent.id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobilePanel, navigate, parent]);

  const graphNavigate = useCallback(
    (nodeId: string) => {
      if (nodeId === selectedId) return;
      navigate(nodeId);
    },
    [navigate, selectedId],
  );

  return (
    <div className="flex h-[100dvh] min-h-[520px] flex-col overflow-hidden bg-ink-950 text-slate-100">
      <ExplorerHeader
        project={project}
        mode={mode}
        onModeChange={setMode}
        path={path}
        canGoBack={Boolean(parent)}
        onBack={goBack}
        onNavigate={navigate}
        query={query}
        onQueryChange={setQuery}
        searchResults={searchResults}
        searchRef={searchRef}
        onReplace={onReplace}
        replacing={replacing}
      />

      <main className="explorer-workspace relative min-h-0 flex-1">
        <aside className={`explorer-panel explorer-panel--left ${mobilePanel === "outline" ? "is-mobile-open" : ""}`}>
          <ReadmeOutline
            roots={roots}
            selectedId={selectedId}
            onNavigate={navigate}
            onClose={() => setMobilePanel(null)}
          />
        </aside>

        <section className="relative min-h-0 min-w-0 overflow-hidden bg-[#0a0d13]" aria-label="README node world">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-ink-950/40 to-transparent" />
          <ReadmeGraph
            mode={mode}
            roots={roots}
            current={current}
            parent={parent}
            onNavigate={graphNavigate}
          />
          <div className="absolute bottom-4 left-4 z-20 flex gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobilePanel("outline")}
              className="mobile-graph-action"
            >
              <ListTree size={14} /> Outline
            </button>
            <button
              type="button"
              onClick={() => setMobilePanel("content")}
              className="mobile-graph-action"
            >
              <AlignLeft size={14} /> Content
            </button>
          </div>
        </section>

        <aside className={`explorer-panel explorer-panel--right ${mobilePanel === "content" ? "is-mobile-open" : ""}`}>
          <ContentPanel
            node={current}
            documentContent={project.document.content ?? []}
            fileName={project.fileName}
            onClose={() => setMobilePanel(null)}
          />
        </aside>

        {mobilePanel ? (
          <button
            type="button"
            className="mobile-panel-backdrop"
            onClick={() => setMobilePanel(null)}
            aria-label="Close panel"
          />
        ) : null}
      </main>
    </div>
  );
}
