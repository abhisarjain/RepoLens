import { describe, expect, it } from "vitest";
import type { ReadmeNode } from "../types/readme";
import { createFocusLayout } from "./graphLayout";

function node(id: string, children: ReadmeNode[] = []): ReadmeNode {
  return { id, title: id, level: 2, content: [], children };
}

describe("createFocusLayout", () => {
  it("spreads very large child sets over multiple readable rings", () => {
    const children = Array.from({ length: 120 }, (_, index) =>
      node(`child-${index + 1}`),
    );
    const current = node("current", children);
    const parent = node("parent", [current]);

    const layout = createFocusLayout(current, parent, {
      width: 900,
      height: 650,
    });
    const childNodes = layout.nodes.filter(
      (entry) => entry.data.role === "child",
    );
    const uniquePositions = new Set(
      childNodes.map(
        (entry) =>
          `${Math.round(entry.position.x)}:${Math.round(entry.position.y)}`,
      ),
    );
    const center = layout.nodes.find((entry) => entry.id === "current")!;
    const radii = childNodes.map((entry) =>
      Math.hypot(
        entry.position.x - center.position.x,
        entry.position.y - center.position.y,
      ),
    );

    expect(childNodes).toHaveLength(120);
    expect(uniquePositions.size).toBe(120);
    expect(Math.max(...radii) - Math.min(...radii)).toBeGreaterThan(700);
  });

  it("keeps the parent in its own visual role", () => {
    const current = node("current", [node("child")]);
    const parent = node("parent", [current]);
    const layout = createFocusLayout(current, parent, {
      width: 900,
      height: 650,
    });

    expect(layout.nodes.find((entry) => entry.id === "parent")?.data.role).toBe(
      "parent",
    );
  });
});
