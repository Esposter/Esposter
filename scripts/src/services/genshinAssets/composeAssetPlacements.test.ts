import { composeAssetPlacements } from "#src/services/genshinAssets/composeAssetPlacements";
import { createSceneObject } from "#src/services/genshinAssets/createSceneObject.test";
import { toObjectKey } from "#src/services/genshinAssets/toObjectKey";
import { describe, expect, test } from "vitest";

describe(composeAssetPlacements, () => {
  test("places a child under its root with what it draws", () => {
    expect.hasAssertions();

    const [, child] = composeAssetPlacements(
      [createSceneObject("1", "0", { position: [1, 0, 0] }), createSceneObject("2", "1")],
      new Map([[toObjectKey("", "2"), { materials: ["b"], mesh: "a", pointers: [] }]]),
    );

    expect(child).toStrictEqual({
      materials: ["b"],
      mesh: "a",
      name: "2",
      position: [1, 0, 0],
      root: "1",
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    });
  });

  test("leaves out an object whose parent the dump lacks, and every object under it", () => {
    expect.hasAssertions();

    const placements = composeAssetPlacements(
      [createSceneObject("1", "0", { position: [1, 2, 3] }), createSceneObject("2", "9"), createSceneObject("3", "2")],
      new Map(),
    );

    expect(placements.map(({ position }) => position)).toStrictEqual([[1, 2, 3]]);
  });
});
