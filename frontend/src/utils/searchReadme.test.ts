import { describe, expect, it } from "vitest";
import type { ReadmeNode } from "../types/readme";
import { searchReadme } from "./searchReadme";

const roots: ReadmeNode[] = [
  {
    id: "root",
    title: "ForgeMind",
    level: 1,
    content: [{ type: "paragraph", text: "Root text" }],
    children: [
      {
        id: "auth",
        title: "Authentication",
        level: 3,
        content: [{ type: "code", code: "const jwt = verify(token);" }],
        children: [],
      },
      {
        id: "jwt",
        title: "JWT",
        level: 2,
        content: [{ type: "paragraph", text: "Signed token details" }],
        children: [],
      },
    ],
  },
];

describe("README search", () => {
  it("searches headings and ranks an exact heading first", () => {
    const results = searchReadme(roots, "JWT");
    expect(results.map((result) => result.node.id)).toEqual(["jwt", "auth"]);
    expect(results[0].matchKind).toBe("heading");
  });

  it("searches deterministic content and includes the heading path", () => {
    const [result] = searchReadme(roots, "verify");
    expect(result.node.id).toBe("auth");
    expect(result.path.map((node) => node.title)).toEqual([
      "ForgeMind",
      "Authentication",
    ]);
    expect(result.matchKind).toBe("content");
  });

  it("does not return results for an empty query", () => {
    expect(searchReadme(roots, "  ")).toEqual([]);
  });
});
