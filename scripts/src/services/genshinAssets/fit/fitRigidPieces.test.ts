import type { DecodedCurve } from "#src/models/genshinAssets/shared/DecodedCurve";
import type { ExportedMesh } from "#src/models/genshinAssets/shared/ExportedMesh";

import { fitRigidPieces } from "#src/services/genshinAssets/fit/fitRigidPieces";
import { Matrix4, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(fitRigidPieces, () => {
  // One bone a unit along x from a father a unit further on, so bound at 2 along x: its bind pose moves it back there
  const bindPose = {
    M00: 1,
    M01: 0,
    M02: 0,
    M03: 0,
    M10: 0,
    M11: 1,
    M12: 0,
    M13: 0,
    M20: 0,
    M21: 0,
    M22: 1,
    M23: 0,
    M30: -2,
    M31: 0,
    M32: 0,
    M33: 1,
  };
  const pathHash = 1;
  const createCurve = (property: string, component: string, samples: number[]): DecodedCurve => ({
    component,
    path: "",
    pathHash,
    property,
    samples,
    type: "",
  });
  const mesh: ExportedMesh = {
    m_BindPose: [bindPose],
    m_BoneNameHashes: [pathHash],
    m_Skin: [{ boneIndex: [0, 0, 0, 0], weight: [1, 0, 0, 0] }],
  };

  test("carries a piece turned about its own bone, wherever its fathers stand it, into where it is bound", () => {
    expect.hasAssertions();

    // A quarter turn about z at the start, none at the end, the bone held a unit along x from its father
    const clip = {
      curves: [
        createCurve("position", "x", [1, 1]),
        createCurve("rotation", "z", [Math.SQRT1_2, 0]),
        createCurve("rotation", "w", [Math.SQRT1_2, 1]),
      ],
      duration: 1,
      name: "",
    };
    const { poses, vertexPieces } = fitRigidPieces(mesh, clip);
    const [[start = new Matrix4(), end = new Matrix4()] = []] = poses;
    const above = new Vector3(2, 1, 0);

    expect(vertexPieces).toStrictEqual([0]);
    expect(
      above
        .clone()
        .applyMatrix4(start)
        .distanceTo(new Vector3(1, 0, 0)),
    ).toBeCloseTo(0);
    expect(above.clone().applyMatrix4(end).toArray()).toStrictEqual([2, 1, 0]);
  });

  test("refuses a vertex weighed between bones", () => {
    expect.hasAssertions();

    expect(() =>
      fitRigidPieces(
        { ...mesh, m_Skin: [{ boneIndex: [0, 0, 0, 0], weight: [0.5, 0.5, 0, 0] }] },
        { curves: [], duration: 0, name: "" },
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: vertex 0, weighs 0.5 on its first bone: a soft skin has no rigid pieces]`,
    );
  });
});
