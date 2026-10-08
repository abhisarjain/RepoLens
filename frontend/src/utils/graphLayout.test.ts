import { describe, expect, it } from "vitest";
import type { ReadmeNode } from "../types/readme";
import { createFocusLayout, createFullGraphLayout } from "./graphLayout";

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

  it("keeps every independent root visible in focus mode", () => {
    const roots = [node("root-1", [node("child")]), node("root-2"), node("root-3"), node("root-4")];
    const layout = createFocusLayout(roots[0], null, { width: 900, height: 650 }, roots);

    expect(layout.nodes.map((entry) => entry.id)).toEqual([
      "root-1", "child", "root-2", "root-3", "root-4",
    ]);
    expect(new Set(layout.nodes.map((entry) => `${entry.position.x}:${entry.position.y}`)).size).toBe(5);
  });

  it("collapses and expands the current parent's children in focus mode", () => {
    const current = node("root", [node("child-1"), node("child-2")]);
    const collapsed = createFocusLayout(current, null, { width: 900, height: 650 }, [current], true);
    const expanded = createFocusLayout(current, null, { width: 900, height: 650 }, [current], false);

    expect(collapsed.nodes.map((entry) => entry.id)).toEqual(["root"]);
    expect(collapsed.nodes[0].data.expanded).toBe(false);
    expect(expanded.nodes.map((entry) => entry.id)).toEqual(["root", "child-1", "child-2"]);
    expect(expanded.nodes[0].data.expanded).toBe(true);
  });
});

describe("createFullGraphLayout", () => {
  it("shows every independent root", () => {
    const roots = [node("root-1"), node("root-2"), node("root-3"), node("root-4")];
    const layout = createFullGraphLayout(roots, "root-1");
    expect(layout.nodes.map((entry) => entry.id)).toEqual([
      "root-1", "root-2", "root-3", "root-4",
    ]);
    expect(new Set(layout.nodes.map((entry) => `${entry.position.x}:${entry.position.y}`)).size).toBe(4);
  });

  it("hides descendants when a parent is collapsed", () => {
    const roots = [node("root", [node("child", [node("grandchild")])])];
    const layout = createFullGraphLayout(roots, "root", new Set(["root"]));
    expect(layout.nodes.map((entry) => entry.id)).toEqual(["root"]);
    expect(layout.nodes[0].data.expanded).toBe(false);
  });
});
