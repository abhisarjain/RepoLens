import { describe, expect, it } from "vitest";
import { flattenReadme, getNodePath, normalizeDocument } from "./readmeTree";

describe("README tree utilities", () => {
  it("preserves duplicate visible titles while retaining unique IDs", () => {
    const document = normalizeDocument({
      fileName: "README.md",
      roots: [
        {
          id: "node-1",
          title: "Root",
          level: 1,
          content: [],
          children: [
            { id: "node-2", title: "Alpha", level: 2, children: [] },
            { id: "node-3", title: "Alpha", level: 2, children: [] },
          ],
        },
      ],
    });
    const nodes = flattenReadme(document.roots);
    expect(nodes.map(({ node }) => node.title)).toEqual(["Root", "Alpha", "Alpha"]);
    expect(new Set(nodes.map(({ node }) => node.id)).size).toBe(3);
  });

  it("returns the exact path through skipped heading levels", () => {
    const document = normalizeDocument({
      roots: [
        {
          id: "root",
          title: "Root",
          level: 1,
          children: [
            {
              id: "deep",
              title: "Deep",
              level: 4,
              children: [],
            },
          ],
        },
      ],
    });
    expect(getNodePath(document.roots, "deep").map((node) => node.title)).toEqual([
      "Root",
      "Deep",
    ]);
    expect(document.roots[0].children[0].level).toBe(4);
  });

  it("accepts a serialized parsed tree", () => {
    const document = normalizeDocument(
      JSON.stringify({ fileName: "README.markdown", roots: [] }),
    );
    expect(document).toEqual({
      fileName: "README.markdown",
      roots: [],
      content: [],
      hasHeadings: false,
    });
  });
});
