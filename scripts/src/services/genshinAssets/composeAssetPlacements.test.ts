import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { composeAssetPlacements } from "#src/services/genshinAssets/composeAssetPlacements";
import { createSceneObject } from "#src/services/genshinAssets/createSceneObject.test";
import { describe, expect, test } from "vitest";

describe(composeAssetPlacements, () => {
  // A quarter turn about y
  const quarterTurn: SceneObject["rotation"] = [0, Math.SQRT1_2, 0, Math.SQRT1_2];

  test("places a child through its parent's position, rotation and scale, under its root", () => {
    expect.hasAssertions();

    const [, child] = composeAssetPlacements(
      [
        createSceneObject("1", "0", { position: [10, 0, 0], rotation: quarterTurn, scale: [2, 2, 2] }),
        createSceneObject("2", "1", { position: [1, 0, 0] }),
      ],
      new Map([["2", { materials: ["b"], mesh: "a" }]]),
    );

    expect(child?.mesh).toBe("a");
    expect(child?.materials).toStrictEqual(["b"]);
    expect(child?.position[0]).toBeCloseTo(10);
    expect(child?.position[2]).toBeCloseTo(-2);
    expect(child?.scale[0]).toBeCloseTo(2);
    expect(child?.root).toBe("1");
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
