import { ReactFlowProvider, type NodeTypes } from "@xyflow/react";
import { FileQuestion } from "lucide-react";
import { useMemo } from "react";
import type { ReadmeNode } from "../../types/readme";
import { FocusGraph } from "./FocusGraph";
import { FullGraph } from "./FullGraph";
import { ReadmeGraphNode } from "./ReadmeGraphNode";

export type ExplorerMode = "focus" | "full";

interface ReadmeGraphProps {
  mode: ExplorerMode;
  roots: ReadmeNode[];
  current: ReadmeNode | null;
  parent: ReadmeNode | null;
  onNavigate: (nodeId: string) => void;
}

export function ReadmeGraph({ mode, roots, current, parent, onNavigate }: ReadmeGraphProps) {
  const nodeTypes = useMemo<NodeTypes>(() => ({ readmeNode: ReadmeGraphNode }), []);
  if (!roots.length || !current) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-grid-dots px-6">
        <div className="max-w-sm text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.025] text-slate-500">
            <FileQuestion size={20} />
          </span>
          <h2 className="text-base font-medium text-slate-200">No heading map to draw</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This file contains no headings. Its document content is still available in the content panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      {mode === "focus" ? (
        <FocusGraph
          current={current}
          parent={parent}
          onNavigate={onNavigate}
          nodeTypes={nodeTypes}
        />
      ) : (
        <FullGraph
          roots={roots}
          selectedId={current.id}
          onNavigate={onNavigate}
          nodeTypes={nodeTypes}
        />
      )}
    </ReactFlowProvider>
  );
}
