import type { ReadmeContent, ReadmeNode } from "../types/readme";
import { flattenReadme } from "./readmeTree";

export interface SearchResult {
  node: ReadmeNode;
  path: ReadmeNode[];
  matchKind: "heading" | "content";
  excerpt: string;
  score: number;
}

function unknownToText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) return value.map(unknownToText).join(" ");
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !["type", "kind", "metadata"].includes(key))
      .map(([, entry]) => unknownToText(entry))
      .join(" ");
  }
  return "";
}

export function contentToSearchText(content: ReadmeContent[]): string {
  return content.map(unknownToText).join(" ").replace(/\s+/g, " ").trim();
}

function makeExcerpt(text: string, query: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return "";
  const at = compact.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  const start = Math.max(0, at - 42);
  const end = Math.min(compact.length, at + query.length + 68);
  return `${start > 0 ? "…" : ""}${compact.slice(start, end)}${end < compact.length ? "…" : ""}`;
}

export function searchReadme(
  roots: ReadmeNode[],
  rawQuery: string,
  limit = 24,
): SearchResult[] {
  const query = rawQuery.trim().toLocaleLowerCase();
  if (!query) return [];

  return flattenReadme(roots)
    .map(({ node, path, index }) => {
      const title = node.title.toLocaleLowerCase();
      const contentText = contentToSearchText(node.content);
      const content = contentText.toLocaleLowerCase();
      const titleIndex = title.indexOf(query);
      const contentIndex = content.indexOf(query);
      if (titleIndex < 0 && contentIndex < 0) return null;
      const headingMatch = titleIndex >= 0;
      const exact = title === query;
      return {
        node,
        path,
        matchKind: headingMatch ? "heading" : "content",
        excerpt: headingMatch
          ? makeExcerpt(node.title, query)
          : makeExcerpt(contentText, query),
        score: exact ? 0 : headingMatch ? 10 + titleIndex : 100 + contentIndex + index / 1000,
      } satisfies SearchResult;
    })
    .filter((result): result is SearchResult => result !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}
