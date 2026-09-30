import type { SceneTreeNode } from "#src/models/genshinAssets/SceneTreeNode";

import { SceneTreeFlag } from "#src/models/genshinAssets/SceneTreeFlag";
import { createSceneObject } from "#src/services/genshinAssets/createSceneObject.test";
import { formatSceneTree } from "#src/services/genshinAssets/formatSceneTree";
import { describe, expect, test } from "vitest";

describe(formatSceneTree, () => {
  test("writes each object on a line indented by its depth, with its place, drawing, named components, children and flags", () => {
    expect.hasAssertions();

    const leaf: SceneTreeNode = {
      children: [],
      flags: [SceneTreeFlag.EmptyAnchor],
      mesh: "",
      object: createSceneObject("", "", { block: "a", name: "b", position: [1, 0, 0] }),
      worldScale: [0.1, 0.1, 0.1],
    };
    const root: SceneTreeNode = {
      children: [leaf],
      flags: [],
      mesh: "c",
      object: { ...leaf.object, childIds: ["", ""], components: ["d"], rotation: [0, 1, 0, 0], scale: [0.1, 0.1, 0.1] },
      worldScale: [0.1, 0.1, 0.1],
    };

    expect(formatSceneTree(root)).toBe(
      "b [a] at 1,0,0, turn 0,1,0,0, scale 0.1,0.1,0.1, world scale 0.1,0.1,0.1, draws c, components d, 2 children, 1 dumped\n  b [a] at 1,0,0, world scale 0.1,0.1,0.1: empty anchor",
    );
  });
});
