import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  useReactFlow,
  useNodesState,
  type NodeTypes,
} from "@xyflow/react";
import { useEffect, useMemo } from "react";
import type { ReadmeNode } from "../../types/readme";
import { createFullGraphLayout } from "../../utils/graphLayout";
import { GraphControls } from "./GraphControls";

interface FullGraphProps {
  roots: ReadmeNode[];
  selectedId: string | null;
  onNavigate: (nodeId: string) => void;
  nodeTypes: NodeTypes;
}

export function FullGraph({ roots, selectedId, onNavigate, nodeTypes }: FullGraphProps) {
  const { fitView } = useReactFlow();
  const layout = useMemo(
    () => createFullGraphLayout(roots, selectedId),
    [roots, selectedId],
  );
  const layoutNodes = useMemo(
    () =>
      layout.nodes.map((node) => ({
        ...node,
        data: { ...node.data, onActivate: () => onNavigate(node.id) },
      })),
    [layout.nodes, onNavigate],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);

  useEffect(() => {
    setNodes(layoutNodes);
  }, [layoutNodes, setNodes]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void fitView({ padding: 0.12, duration: 360, maxZoom: 1 });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fitView, roots]);

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      edges={layout.edges}
      nodeTypes={nodeTypes}
      nodesDraggable
      nodesConnectable={false}
      panOnDrag
      zoomOnScroll
      zoomOnPinch
      minZoom={0.15}
      maxZoom={1.5}
      fitView
      fitViewOptions={{ padding: 0.12, maxZoom: 1 }}
      proOptions={{ hideAttribution: true }}
      aria-label="Complete README heading map"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1.1}
        color="rgba(139, 160, 181, .14)"
      />
      <MiniMap
        pannable
        zoomable
        position="bottom-left"
        nodeColor={(node) => (node.id === selectedId ? "#5ed2f5" : "#303847")}
        maskColor="rgba(9, 11, 16, .72)"
        className="!h-[92px] !w-[134px] !rounded-xl !border !border-white/10 !bg-ink-900/85"
        ariaLabel="README map overview"
      />
      <GraphControls />
    </ReactFlow>
  );
}
