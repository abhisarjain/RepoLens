import {
  Background,
  BackgroundVariant,
  ReactFlow,
  useReactFlow,
  useNodesState,
  type NodeTypes,
} from "@xyflow/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReadmeNode } from "../../types/readme";
import { createFocusLayout } from "../../utils/graphLayout";
import { GraphControls } from "./GraphControls";

interface FocusGraphProps {
  roots: ReadmeNode[];
  current: ReadmeNode;
  parent: ReadmeNode | null;
  onNavigate: (nodeId: string) => void;
  nodeTypes: NodeTypes;
}

function useElementSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 900, height: 650 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, size };
}

function FocusGraphCanvas({ roots, current, parent, onNavigate, nodeTypes }: FocusGraphProps) {
  const { ref, size } = useElementSize();
  const { fitView } = useReactFlow();
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());
  const collapsed = collapsedIds.has(current.id);
  const layout = useMemo(
    () => createFocusLayout(current, parent, size, roots, collapsed),
    [collapsed, current, parent, roots, size],
  );
  const layoutNodes = useMemo(
    () =>
      layout.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onActivate: () => {
            if (node.id !== current.id || !current.children.length) {
              onNavigate(node.id);
              return;
            }
            setCollapsedIds((value) => {
              const next = new Set(value);
              if (next.has(current.id)) next.delete(current.id);
              else next.add(current.id);
              return next;
            });
          },
        },
      })),
    [current.children.length, current.id, layout.nodes, onNavigate],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);

  useEffect(() => {
    setNodes(layoutNodes);
  }, [layoutNodes, setNodes]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void fitView({ padding: 0.15, duration: 360, maxZoom: 1 });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [collapsed, current.id, fitView, nodes.length]);

  return (
    <div ref={ref} className="absolute inset-0">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={layout.edges}
        nodeTypes={nodeTypes}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.08}
        maxZoom={1.35}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
        aria-label={`Focus map for ${current.title}`}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.1}
          color="rgba(139, 160, 181, .14)"
        />
        <GraphControls />
      </ReactFlow>
    </div>
  );
}

export function FocusGraph(props: FocusGraphProps) {
  return <FocusGraphCanvas {...props} />;
}
