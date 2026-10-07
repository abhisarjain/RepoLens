export type ReadmeContentType =
  | "paragraph"
  | "code"
  | "unordered-list"
  | "ordered-list"
  | "list"
  | "blockquote"
  | "image"
  | "link"
  | "table"
  | "horizontal-rule"
  | "thematic-break"
  | string;

export interface ReadmeListItem {
  rawMarkdown?: string;
  text?: string;
  content?: string;
  children?: ReadmeList[];
  items?: ReadmeListItem[];
  [key: string]: unknown;
}

export interface ReadmeList {
  ordered: boolean;
  start?: number;
  items: ReadmeListItem[];
}

export interface ReadmeInline {
  type: string;
  rawMarkdown?: string;
  text?: string;
  url?: string;
  alt?: string;
  title?: string;
}

export interface ReadmeContent {
  type: ReadmeContentType;
  rawMarkdown?: string;
  text?: string;
  raw?: string;
  markdown?: string;
  content?: string;
  code?: string;
  language?: string;
  lang?: string;
  ordered?: boolean;
  items?: Array<ReadmeListItem | string>;
  inlines?: ReadmeInline[];
  list?: ReadmeList;
  url?: string;
  href?: string;
  src?: string;
  alt?: string;
  title?: string;
  headers?: string[];
  rows?: string[][];
  alignments?: Array<"left" | "center" | "right" | null>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ReadmeNode {
  id: string;
  title: string;
  level: number;
  content: ReadmeContent[];
  children: ReadmeNode[];
}

export interface ReadmeDocument {
  fileName: string;
  roots: ReadmeNode[];
  content?: ReadmeContent[];
  hasHeadings?: boolean;
}

export interface FlatReadmeNode {
  node: ReadmeNode;
  parentId: string | null;
  path: ReadmeNode[];
  depth: number;
  index: number;
}
