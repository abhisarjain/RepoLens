import type {
  FlatReadmeNode,
  ReadmeContent,
  ReadmeDocument,
  ReadmeNode,
} from "../types/readme";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const asNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export function normalizeContent(value: unknown): ReadmeContent[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return { type: "paragraph", text: entry } satisfies ReadmeContent;
      }
      const record = asRecord(entry);
      if (!record) return null;
      const type = asString(record.type ?? record.kind, "paragraph")
        .toLowerCase()
        .replaceAll("_", "-");
      return { ...record, type } as ReadmeContent;
    })
    .filter((entry): entry is ReadmeContent => entry !== null);
}

function normalizeNode(value: unknown, fallbackId: string): ReadmeNode | null {
  const record = asRecord(value);
  if (!record) return null;
  const childrenValue = record.children ?? record.nodes;
  const children = Array.isArray(childrenValue)
    ? childrenValue
        .map((child, index) => normalizeNode(child, `${fallbackId}-${index + 1}`))
        .filter((node): node is ReadmeNode => node !== null)
    : [];

  // Do not trim, rewrite, or suffix titles: the server's heading text is canonical.
  const title = asString(record.title ?? record.heading ?? record.name);
  return {
    id: String(record.id ?? fallbackId),
    title,
    level: asNumber(record.level ?? record.depth, 1),
    content: normalizeContent(record.content ?? record.blocks),
    children,
  };
}

function maybeParseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

export function normalizeDocument(
  value: unknown,
  fallbackFileName = "README.md",
): ReadmeDocument {
  const parsed = maybeParseJson(value);
  const record = asRecord(parsed) ?? {};
  const rootsValue = record.roots ?? record.rootNodes ?? record.nodes ?? [];
  const roots = Array.isArray(rootsValue)
    ? rootsValue
        .map((node, index) => normalizeNode(node, `node-${index + 1}`))
        .filter((node): node is ReadmeNode => node !== null)
    : [];
  return {
    fileName: asString(record.fileName ?? record.filename, fallbackFileName),
    roots,
    content: normalizeContent(
      record.content ?? record.preamble ?? record.documentContent,
    ),
    hasHeadings:
      typeof record.hasHeadings === "boolean"
        ? record.hasHeadings
        : roots.length > 0,
  };
}

export function flattenReadme(roots: ReadmeNode[]): FlatReadmeNode[] {
  const flattened: FlatReadmeNode[] = [];
  let index = 0;

  const visit = (
    nodes: ReadmeNode[],
    parentId: string | null,
    path: ReadmeNode[],
    depth: number,
  ) => {
    nodes.forEach((node) => {
      const nextPath = [...path, node];
      flattened.push({ node, parentId, path: nextPath, depth, index });
      index += 1;
      visit(node.children, node.id, nextPath, depth + 1);
    });
  };

  visit(roots, null, [], 0);
  return flattened;
}

export function findNode(
  roots: ReadmeNode[],
  nodeId: string | null,
): ReadmeNode | null {
  if (!nodeId) return null;
  const flat = flattenReadme(roots);
  return flat.find(({ node }) => node.id === nodeId)?.node ?? null;
}

export function getNodePath(
  roots: ReadmeNode[],
  nodeId: string | null,
): ReadmeNode[] {
  if (!nodeId) return [];
  return flattenReadme(roots).find(({ node }) => node.id === nodeId)?.path ?? [];
}

export function getParentNode(
  roots: ReadmeNode[],
  nodeId: string | null,
): ReadmeNode | null {
  if (!nodeId) return null;
  const flat = flattenReadme(roots);
  const entry = flat.find(({ node }) => node.id === nodeId);
  if (!entry?.parentId) return null;
  return flat.find(({ node }) => node.id === entry.parentId)?.node ?? null;
}

export function countNodes(roots: ReadmeNode[]): number {
  return flattenReadme(roots).length;
}
