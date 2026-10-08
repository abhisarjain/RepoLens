import type { Content, Heading, List, ListItem, Root, RootContent } from "mdast";
import { toString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { ReadmeContent, ReadmeList, ReadmeListItem, ReadmeNode } from "../types/readme";

type PositionedNode = Content & {
  position?: { start?: { offset?: number }; end?: { offset?: number } };
  align?: Array<"left" | "right" | "center" | null>;
  children?: Content[];
};

function sourceFor(node: PositionedNode, markdown: string): string {
  const start = node.position?.start?.offset;
  const end = node.position?.end?.offset;
  return typeof start === "number" && typeof end === "number"
    ? markdown.slice(start, end)
    : toString(node);
}

function listItem(item: ListItem, markdown: string): ReadmeListItem {
  const nested = item.children.filter((child): child is List => child.type === "list");
  const ownContent = item.children.filter((child) => child.type !== "list");
  return {
    text: ownContent.map((child) => toString(child)).filter(Boolean).join("\n"),
    rawMarkdown: ownContent.map((child) => sourceFor(child as PositionedNode, markdown)).join("\n"),
    children: nested.map((child) => structuredList(child, markdown)),
  };
}

function structuredList(node: List, markdown: string): ReadmeList {
  return {
    ordered: node.ordered === true,
    start: node.start ?? undefined,
    items: node.children.map((item) => listItem(item, markdown)),
  };
}

function contentBlock(node: RootContent, markdown: string): ReadmeContent | null {
  const positioned = node as PositionedNode;
  const rawMarkdown = sourceFor(positioned, markdown);

  switch (node.type) {
    case "paragraph": {
      if (node.children.length === 1 && node.children[0].type === "image") {
        const image = node.children[0];
        return { type: "image", rawMarkdown, src: image.url, alt: image.alt ?? "", title: image.title ?? undefined };
      }
      if (node.children.length === 1 && node.children[0].type === "link") {
        const link = node.children[0];
        return { type: "link", rawMarkdown, href: link.url, text: toString(link), title: link.title ?? undefined };
      }
      return { type: "paragraph", rawMarkdown, text: toString(node) };
    }
    case "code":
      return { type: "code", rawMarkdown, text: node.value, language: node.lang ?? undefined };
    case "list":
      return {
        type: node.ordered ? "ordered-list" : "unordered-list",
        rawMarkdown,
        ordered: node.ordered === true,
        list: structuredList(node, markdown),
      };
    case "blockquote":
      return { type: "blockquote", rawMarkdown, text: toString(node) };
    case "thematicBreak":
      return { type: "horizontal-rule", rawMarkdown };
    case "html":
      return { type: "paragraph", rawMarkdown, text: node.value };
    case "table": {
      const rows = node.children.map((row) => row.children.map((cell) => toString(cell)));
      return {
        type: "table",
        rawMarkdown,
        headers: rows[0] ?? [],
        rows: rows.slice(1),
        alignments: positioned.align ?? [],
      };
    }
    default:
      return rawMarkdown ? { type: "paragraph", rawMarkdown, text: toString(node) } : null;
  }
}

export function parseMarkdown(markdown: string, fileName: string) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const roots: ReadmeNode[] = [];
  const documentContent: ReadmeContent[] = [];
  const stack: ReadmeNode[] = [];
  let current: ReadmeNode | null = null;
  let nodeNumber = 0;

  for (const child of tree.children) {
    if (child.type === "heading") {
      const heading = child as Heading;
      const node: ReadmeNode = {
        id: `node-${++nodeNumber}`,
        title: toString(heading),
        level: heading.depth,
        content: [],
        children: [],
      };
      while (stack.length && stack[stack.length - 1].level >= node.level) stack.pop();
      if (stack.length) stack[stack.length - 1].children.push(node);
      else roots.push(node);
      stack.push(node);
      current = node;
      continue;
    }

    const block = contentBlock(child, markdown);
    if (block) (current ? current.content : documentContent).push(block);
  }

  return { fileName, roots, content: documentContent, hasHeadings: roots.length > 0 };
}
