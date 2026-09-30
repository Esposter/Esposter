import { SceneTreeFlag } from "#src/models/genshinAssets/SceneTreeFlag";
import { composeSceneTree } from "#src/services/genshinAssets/composeSceneTree";
import { createSceneObject } from "#src/services/genshinAssets/createSceneObject.test";
import { toObjectKey } from "#src/services/genshinAssets/toObjectKey";
import { describe, expect, test } from "vitest";

describe(composeSceneTree, () => {
  test("nests each child under its father with its scale composed, and flags an empty anchor and a root at the origin", () => {
    expect.hasAssertions();

    const [root] = composeSceneTree(
      [
        createSceneObject("1", "0", { childIds: ["2"], components: [" "], scale: [0.1, 0.1, 0.1] }),
        createSceneObject("2", "1"),
      ],
      new Map(),
    );

    expect(root?.flags).toStrictEqual([SceneTreeFlag.RootAtOrigin]);
    expect(root?.children.map(({ flags, worldScale }) => ({ flags, worldScale }))).toStrictEqual([
      { flags: [SceneTreeFlag.EmptyAnchor], worldScale: [0.1, 0.1, 0.1] },
    ]);
  });

  test("tops an object whose father no dump holds, and flags a father's children the dumps lack", () => {
    expect.hasAssertions();

    const tops = composeSceneTree(
      [createSceneObject("1", "0", { childIds: ["-1"], position: [0.1, 0, 0] }), createSceneObject("2", "-1")],
      new Map([[toObjectKey("", "2"), { materials: [], mesh: "", pointers: [] }]]),
    );

    expect(tops.map(({ flags }) => flags)).toStrictEqual([
      [SceneTreeFlag.LostChildren],
      [SceneTreeFlag.EmptyAnchor, SceneTreeFlag.LostFather],
    ]);
  });

  test("flags a mesh laid out under two tops", () => {
    expect.hasAssertions();

    const tops = composeSceneTree(
      [createSceneObject("1", "0", { position: [0.1, 0, 0] }), createSceneObject("2", "0", { position: [0.1, 0, 0] })],
      new Map([
        [toObjectKey("", "1"), { materials: [], mesh: " ", pointers: [] }],
        [toObjectKey("", "2"), { materials: [], mesh: " ", pointers: [] }],
      ]),
    );

    expect(tops.map(({ flags }) => flags)).toStrictEqual([[SceneTreeFlag.SharedMesh], [SceneTreeFlag.SharedMesh]]);
  });
});
