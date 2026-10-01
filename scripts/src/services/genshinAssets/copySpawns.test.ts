import { copySpawns } from "#src/services/genshinAssets/copySpawns";
import { createSceneObject } from "#src/services/genshinAssets/createSceneObject.test";
import { describe, expect, test } from "vitest";

describe(copySpawns, () => {
  test("lays a spawned prefab's subtree out as its row ahead of its own place, the step in its anchor's space", () => {
    expect.hasAssertions();

    // An anchor at half scale, so a world step of 2 is 4 of the root's own position
    const objects = copySpawns(
      [
        createSceneObject("1", "0", { block: "a", scale: [0.5, 0.5, 0.5] }),
        createSceneObject("2", "1", { block: "a", childIds: ["3"] }),
        createSceneObject("3", "2", { block: "a" }),
      ],
      [
        {
          anchor: { block: "a.blk", name: "", pathId: "1" },
          copies: { count: 3, step: [0, 0, 2] },
          prefab: { block: "a.blk", name: "", pathId: "2" },
        },
      ],
    );

    expect(objects.map(({ parentId, position, transformId }) => [transformId, parentId, position[2]])).toStrictEqual([
      ["1", "0", 0],
      ["2", "1", 0],
      ["3", "2", 0],
      ["2~1", "1", 4],
      ["3~1", "2~1", 0],
      ["2~2", "1", 8],
      ["3~2", "2~2", 0],
    ]);
  });
});
