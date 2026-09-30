import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { composeWorldMatrices } from "#src/services/genshinAssets/composeWorldMatrices";
import { createSceneObject } from "#src/services/genshinAssets/createSceneObject.test";
import { toObjectKey } from "#src/services/genshinAssets/toObjectKey";
import { Matrix4, Quaternion, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(composeWorldMatrices, () => {
  // A quarter turn about y
  const quarterTurn: SceneObject["rotation"] = [0, Math.SQRT1_2, 0, Math.SQRT1_2];

  test("places a child by its parent's scale, then its turn, then its position, and multiplies their scales", () => {
    expect.hasAssertions();

    const world = composeWorldMatrices([
      createSceneObject("1", "0", { position: [1, 0, 0], rotation: quarterTurn, scale: [2, 2, 2] }),
      createSceneObject("2", "1", { position: [1, 0, 0], scale: [0.1, 0.1, 0.1] }),
    ]).get(toObjectKey("", "2"));
    const position = new Vector3();
    const scale = new Vector3();
    world?.decompose(position, new Quaternion(), scale);

    expect(position.x).toBeCloseTo(1);
    expect(position.z).toBeCloseTo(-2);
    expect(scale.x).toBeCloseTo(0.2);
  });

  test("composes a chain that loops back on itself no further than where it closes", () => {
    expect.hasAssertions();

    const world = composeWorldMatrices([
      createSceneObject("1", "2", { position: [1, 0, 0] }),
      createSceneObject("2", "1", { position: [1, 0, 0] }),
    ]);

    expect(new Vector3().setFromMatrixPosition(world.get(toObjectKey("", "1")) ?? new Matrix4()).x).toBe(2);
  });

  test("composes an object under its parent in its own file when another file reuses their path IDs", () => {
    expect.hasAssertions();

    const world = composeWorldMatrices([
      createSceneObject("1", "0", { file: "a", position: [1, 0, 0] }),
      createSceneObject("2", "1", { file: "a" }),
      createSceneObject("1", "0", { file: "b", position: [5, 0, 0] }),
    ]);

    expect(new Vector3().setFromMatrixPosition(world.get(toObjectKey("a", "2")) ?? new Matrix4()).x).toBe(1);
  });
});
