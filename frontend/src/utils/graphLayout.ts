import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import type { ReadmeNode } from "../types/readme";

export interface GraphNodeData extends Record<string, unknown> {
  label: string;
  level: number;
  childCount: number;
  role: "current" | "child" | "parent" | "tree";
  selected: boolean;
}

export type ReadmeFlowNode = Node<GraphNodeData, "readmeNode">;

const FULL_NODE_WIDTH = 214;
const FULL_NODE_HEIGHT = 84;
const FOCUS_NODE_GAP = 56;
const FOCUS_RING_GAP = 190;

function toGraphNode(
  node: ReadmeNode,
  role: GraphNodeData["role"],
  selected: boolean,
  position = { x: 0, y: 0 },
): ReadmeFlowNode {
  return {
    id: node.id,
    type: "readmeNode",
    position,
    data: {
      label: node.title,
      level: node.level,
      childCount: node.children.length,
      role,
      selected,
    },
    selectable: true,
    focusable: true,
  };
}

export function createFocusLayout(
  current: ReadmeNode,
  parent: ReadmeNode | null,
  viewport: { width: number; height: number },
): { nodes: ReadmeFlowNode[]; edges: Edge[] } {
  const width = Math.max(viewport.width, 640);
  const height = Math.max(viewport.height, 480);
  const center = { x: width / 2 - 112, y: height / 2 - 56 };
  const count = current.children.length;
  const baseRadius = Math.max(245, Math.min(width, height) * 0.36);
  const availableAngle = parent ? (Math.PI * 5) / 3 : Math.PI * 2;

  const nodes: ReadmeFlowNode[] = [
    toGraphNode(current, "current", true, center),
  ];
  const edges: Edge[] = [];

  let childIndex = 0;
  let ringIndex = 0;

  // Large sibling sets are distributed over expanding rings instead of being
  // squeezed onto one circumference. The arc-length capacity keeps neighboring
  // nodes readable while React Flow still allows zooming and panning the world.
  while (childIndex < count) {
    const radius = baseRadius + ringIndex * FOCUS_RING_GAP;
    const capacity = Math.max(
      parent ? 5 : 6,
      Math.floor(
        (availableAngle * radius) / (FULL_NODE_WIDTH + FOCUS_NODE_GAP),
      ),
    );
    const ringCount = Math.min(capacity, count - childIndex);
    const angleStep = availableAngle / Math.max(ringCount, 1);
    const startAngle = parent
      ? (-Math.PI * 5) / 6 + angleStep / 2
      : -Math.PI / 2 + (ringIndex % 2 === 1 ? angleStep / 2 : 0);

    for (let slot = 0; slot < ringCount; slot += 1) {
      const child = current.children[childIndex];
      const angle = startAngle + angleStep * slot;
      const xRadius = radius * 1.08;
      nodes.push(
        toGraphNode(child, "child", false, {
          x: center.x + Math.cos(angle) * xRadius,
          y: center.y + Math.sin(angle) * radius,
        }),
      );
      edges.push({
        id: `${current.id}->${child.id}`,
        source: current.id,
        target: child.id,
        type: "smoothstep",
        animated: false,
        className: "repolens-edge",
      });
      childIndex += 1;
    }

    ringIndex += 1;
  }

  if (parent) {
    nodes.push(
      toGraphNode(parent, "parent", false, {
        x: center.x - (baseRadius * 1.08 + 92),
        y: center.y,
      }),
    );
    edges.push({
      id: `${parent.id}->${current.id}`,
      source: parent.id,
      target: current.id,
      type: "smoothstep",
      className: "repolens-edge repolens-edge--context",
    });
  }

  return { nodes, edges };
}

export function createFullGraphLayout(
  roots: ReadmeNode[],
  selectedId: string | null,
): { nodes: ReadmeFlowNode[]; edges: Edge[] } {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "TB",
    ranksep: 100,
    nodesep: 54,
    edgesep: 24,
    marginx: 48,
    marginy: 48,
  });

  const sourceNodes: ReadmeNode[] = [];
  const edges: Edge[] = [];
  const visit = (node: ReadmeNode) => {
    sourceNodes.push(node);
    graph.setNode(node.id, { width: FULL_NODE_WIDTH, height: FULL_NODE_HEIGHT });
    node.children.forEach((child) => {
      graph.setEdge(node.id, child.id);
      edges.push({
        id: `${node.id}->${child.id}`,
        source: node.id,
        target: child.id,
        type: "smoothstep",
        className: "repolens-edge",
      });
      visit(child);
    });
  };
  roots.forEach(visit);
  dagre.layout(graph);

  const nodes = sourceNodes.map((node) => {
    const position = graph.node(node.id) as { x: number; y: number };
    return toGraphNode(node, "tree", node.id === selectedId, {
      x: position.x - FULL_NODE_WIDTH / 2,
      y: position.y - FULL_NODE_HEIGHT / 2,
    });
  });

  return { nodes, edges };
}
