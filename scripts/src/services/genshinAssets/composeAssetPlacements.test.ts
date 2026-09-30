import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { composeAssetPlacements } from "#src/services/genshinAssets/composeAssetPlacements";
import { describe, expect, test } from "vitest";

describe(composeAssetPlacements, () => {
  const identity: Pick<SceneObject, "rotation" | "scale"> = { rotation: [0, 0, 0, 1], scale: [1, 1, 1] };
  // A quarter turn about y
  const quarterTurn: SceneObject["rotation"] = [0, Math.SQRT1_2, 0, Math.SQRT1_2];

  test("places a child through its parent's position, rotation and scale, under its root", () => {
    expect.hasAssertions();

    const [, child] = composeAssetPlacements(
      [
        {
          name: "root",
          parentId: "0",
          position: [10, 0, 0],
          rotation: quarterTurn,
          scale: [2, 2, 2],
          transformId: "1",
        },
        { ...identity, name: "a", parentId: "1", position: [1, 0, 0], transformId: "2" },
      ],
      new Map([["a", { materials: ["b"], mesh: "a" }]]),
    );

    expect(child?.mesh).toBe("a");
    expect(child?.materials).toStrictEqual(["b"]);
    expect(child?.position[0]).toBeCloseTo(10);
    expect(child?.position[2]).toBeCloseTo(-2);
    expect(child?.scale[0]).toBeCloseTo(2);
    expect(child?.root).toBe("root");
  });

  test("leaves out an object whose parent the dump lacks, and every object under it", () => {
    expect.hasAssertions();

    const placements = composeAssetPlacements(
      [
        { ...identity, name: "", parentId: "0", position: [1, 2, 3], transformId: "1" },
        { ...identity, name: "", parentId: "9", position: [0, 0, 0], transformId: "2" },
        { ...identity, name: "", parentId: "2", position: [0, 0, 0], transformId: "3" },
      ],
      new Map(),
    );

    expect(placements.map(({ position }) => position)).toStrictEqual([[1, 2, 3]]);
  });
});
