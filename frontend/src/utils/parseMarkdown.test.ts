import { describe, expect, it } from "vitest";
import { parseMarkdown } from "./parseMarkdown";

describe("parseMarkdown", () => {
  it("preserves duplicate headings while assigning unique IDs", () => {
    const document = parseMarkdown("# Setup\nFirst\n# Setup\nSecond", "README.md");
    expect(document.roots.map((node) => node.title)).toEqual(["Setup", "Setup"]);
    expect(document.roots.map((node) => node.id)).toEqual(["node-1", "node-2"]);
  });

  it("attaches skipped heading levels to the nearest lower-level heading", () => {
    const document = parseMarkdown("## Parent\n#### Child\n###### Grandchild", "README.md");
    expect(document.roots[0].children[0].title).toBe("Child");
    expect(document.roots[0].children[0].children[0].level).toBe(6);
  });

  it("keeps content with the heading that precedes it", () => {
    const document = parseMarkdown("Before\n\n# One\nAlpha\n\n## Two\nBeta", "README.md");
    expect(document.content?.[0].text).toBe("Before");
    expect(document.roots[0].content[0].text).toBe("Alpha");
    expect(document.roots[0].children[0].content[0].text).toBe("Beta");
  });

  it("supports a headingless document", () => {
    const document = parseMarkdown("Just **some** text.", "notes.md");
    expect(document.hasHeadings).toBe(false);
    expect(document.roots).toEqual([]);
    expect(document.content?.[0].rawMarkdown).toBe("Just **some** text.");
  });
});
