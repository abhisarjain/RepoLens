import { ChevronDown, ChevronRight, FileCode2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReadmeNode } from "../../types/readme";
import { flattenReadme, getNodePath } from "../../utils/readmeTree";

interface ReadmeOutlineProps {
  roots: ReadmeNode[];
  selectedId: string | null;
  onNavigate: (nodeId: string) => void;
  onClose?: () => void;
}

interface OutlineItemProps {
  node: ReadmeNode;
  depth: number;
  selectedId: string | null;
  expanded: Set<string>;
  toggle: (id: string) => void;
  onNavigate: (id: string) => void;
}

function OutlineItem({
  node,
  depth,
  selectedId,
  expanded,
  toggle,
  onNavigate,
}: OutlineItemProps) {
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.id);
  const selected = node.id === selectedId;
  return (
    <li>
      <div
        className={`group relative flex min-h-8 items-center rounded-md pr-1 transition-colors ${
          selected ? "bg-lens-400/[0.09]" : "hover:bg-white/[0.035]"
        }`}
        style={{ paddingLeft: `${Math.min(depth, 8) * 13 + 4}px` }}
      >
        {depth > 0 ? (
          <span
            className="absolute bottom-0 top-0 w-px bg-white/[0.045]"
            style={{ left: `${Math.min(depth, 8) * 13 - 3}px` }}
            aria-hidden="true"
          />
        ) : null}
        <button
          type="button"
          onClick={() => hasChildren && toggle(node.id)}
          className={`mr-0.5 grid h-6 w-6 shrink-0 place-items-center rounded text-slate-600 hover:text-slate-300 ${hasChildren ? "" : "invisible"}`}
          aria-label={`${isOpen ? "Collapse" : "Expand"} ${node.title}`}
          tabIndex={hasChildren ? 0 : -1}
        >
          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <button
          type="button"
          onClick={() => onNavigate(node.id)}
          className={`min-w-0 flex-1 truncate py-1.5 text-left text-[12px] ${
            selected ? "font-medium text-lens-300" : "text-slate-400 group-hover:text-slate-200"
          }`}
          title={node.title}
        >
          {node.title}
        </button>
        <span className="ml-1 shrink-0 font-mono text-[8px] text-slate-700">H{node.level}</span>
      </div>
      {hasChildren && isOpen ? (
        <ul>
          {node.children.map((child) => (
            <OutlineItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              toggle={toggle}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function ReadmeOutline({ roots, selectedId, onNavigate, onClose }: ReadmeOutlineProps) {
  const branchIds = useMemo(
    () =>
      flattenReadme(roots)
        .filter(({ node }) => node.children.length > 0)
        .map(({ node }) => node.id),
    [roots],
  );
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(branchIds.slice(0, 30)),
  );

  useEffect(() => {
    const path = getNodePath(roots, selectedId);
    setExpanded((current) => {
      const next = new Set(current);
      path.forEach((node) => next.add(node.id));
      return next;
    });
  }, [roots, selectedId]);

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center border-b border-white/[0.07] px-3.5">
        <FileCode2 size={13} className="mr-2 text-slate-600" />
        <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
          README outline
        </span>
        <span className="mr-1 rounded bg-white/[0.035] px-1.5 py-0.5 font-mono text-[9px] text-slate-600">
          {flattenReadme(roots).length}
        </span>
        {onClose ? (
          <button type="button" onClick={onClose} className="mobile-panel-close" aria-label="Close outline">
            <X size={16} />
          </button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2.5 scrollbar-thin">
        {roots.length ? (
          <ul className="space-y-0.5">
            {roots.map((root) => (
              <OutlineItem
                key={root.id}
                node={root}
                depth={0}
                selectedId={selectedId}
                expanded={expanded}
                toggle={toggle}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        ) : (
          <div className="px-3 py-8 text-center text-xs leading-5 text-slate-600">
            No headings were found in this file.
          </div>
        )}
      </div>
    </div>
  );
}
