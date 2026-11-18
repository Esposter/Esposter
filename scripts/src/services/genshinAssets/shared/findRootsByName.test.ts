import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

import { findRootsByName } from "#src/services/genshinAssets/shared/findRootsByName";
import { describe, expect, test } from "vitest";

describe(findRootsByName, () => {
  const FILE = "cab-a";
  const BLOCK = "00/00000001.blk";
  const ROOT_NAME = "SceneObj_Chest_NormalChest";
  const CHILD_NAME = "SceneObj_Chest_NormalChest_Lid";
  const ROOT_GAME_OBJECT_ID = "10";
  const cabMap = new Map<string, CabEntry>([[FILE, { block: BLOCK, dependencies: [], offset: 0 }]]);
  const createObject = (overrides: Partial<SceneObject>): SceneObject => ({
    block: "00000001",
    childIds: [],
    components: [],
    file: FILE,
    gameObjectId: "0",
    name: "",
    parentFile: FILE,
    parentId: "0",
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    scale: [1, 1, 1],
    transformId: "0",
    ...overrides,
  });
  // A prefab's root holds one child, and a name the child holds is climbed from the child to the root above it
  const layout = {
    objects: [
      createObject({ childIds: ["21"], gameObjectId: ROOT_GAME_OBJECT_ID, name: ROOT_NAME, transformId: "11" }),
      createObject({ gameObjectId: "20", name: CHILD_NAME, parentId: "11", transformId: "21" }),
    ],
  };

  test("a name a child holds resolves to the root of its prefab, named by its block", () => {
    expect.hasAssertions();

    expect(findRootsByName(layout, cabMap, CHILD_NAME)).toStrictEqual([
      { block: BLOCK, name: ROOT_NAME, pathId: ROOT_GAME_OBJECT_ID },
    ]);
  });

  test("refuses a name no layout holds", () => {
    expect.hasAssertions();

    expect(() => findRootsByName(layout, cabMap, "SceneObj_Chest_NoSuchChest")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: SceneObj_Chest_NoSuchChest, names no prefab root in the dumped layouts]`,
    );
  });
});
