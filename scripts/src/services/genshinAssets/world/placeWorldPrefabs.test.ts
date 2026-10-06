import { composeAssetPlacements } from "#src/services/genshinAssets/shared/composeAssetPlacements";
import { createSceneObject } from "#src/services/genshinAssets/shared/createSceneObject.test";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { placeWorldPrefabs } from "#src/services/genshinAssets/world/placeWorldPrefabs";
import { describe, expect, test } from "vitest";

describe(placeWorldPrefabs, () => {
  test("draws a prefab's subtree at each of its places, composed through the place, under the prefab's name", () => {
    expect.hasAssertions();

    const objects = placeWorldPrefabs(
      [
        createSceneObject("1", "0", { block: "a", childIds: ["2"] }),
        createSceneObject("2", "1", { block: "a", position: [1, 0, 0] }),
      ],
      [
        {
          places: [
            { position: [1, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] },
            { position: [0, 0, 1], rotation: [0, 0, 0, 1], scale: [2, 2, 2] },
          ],
          prefab: { block: "a.blk", name: "", pathId: "1" },
        },
      ],
    );
    const placements = composeAssetPlacements(
      objects,
      new Map([[toObjectKey("", "2"), { materials: [], mesh: "a", pointers: [] }]]),
    );

    expect(placements.filter(({ mesh }) => mesh).map(({ position, root }) => [root, position])).toStrictEqual([
      ["1", [2, 0, 0]],
      ["1", [2, 0, 1]],
    ]);
  });

  test("leaves a prefab no dump holds as the objects are", () => {
    expect.hasAssertions();

    const objects = [createSceneObject("1", "0", { block: "a" })];

    expect(
      placeWorldPrefabs(objects, [
        {
          places: [{ position: [1, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] }],
          prefab: { block: "b.blk", name: "", pathId: "1" },
        },
      ]),
    ).toStrictEqual(objects);
  });
});
