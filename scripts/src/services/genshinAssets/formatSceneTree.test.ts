import type { SceneTreeNode } from "#src/models/genshinAssets/SceneTreeNode";

import { SceneTreeFlag } from "#src/models/genshinAssets/SceneTreeFlag";
import { formatSceneTree } from "#src/services/genshinAssets/formatSceneTree";
import { describe, expect, test } from "vitest";

describe(formatSceneTree, () => {
  test("writes each object on a line indented by its depth, with its place, drawing, scripts, children and flags", () => {
    expect.hasAssertions();

    const leaf: SceneTreeNode = {
      children: [],
      flags: [SceneTreeFlag.EmptyAnchor],
      mesh: "",
      object: {
        block: "a",
        childIds: [],
        gameObjectId: "",
        name: "b",
        parentId: "",
        position: [1, 0, 0],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
        scripts: [],
        transformId: "",
      },
      worldScale: [0.1, 0.1, 0.1],
    };
    const root: SceneTreeNode = {
      children: [leaf],
      flags: [],
      mesh: "c",
      object: { ...leaf.object, childIds: ["", ""], rotation: [0, 1, 0, 0], scale: [0.1, 0.1, 0.1], scripts: ["d"] },
      worldScale: [0.1, 0.1, 0.1],
    };

    expect(formatSceneTree(root)).toBe(
      "b [a] at 1,0,0, turn 0,1,0,0, scale 0.1,0.1,0.1, world scale 0.1,0.1,0.1, draws c, scripts d, 2 children, 1 dumped\n  b [a] at 1,0,0, world scale 0.1,0.1,0.1: empty anchor",
    );
  });
});
