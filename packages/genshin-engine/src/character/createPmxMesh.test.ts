import type { PmxMaterial } from "#src/models/character/PmxMaterial";
import type { PmxModel } from "#src/models/character/PmxModel";

import { createPmxMesh } from "#src/character/createPmxMesh";
import { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import { Matrix4, MeshBasicMaterial, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createPmxMesh, () => {
  test("places each bone from its parent, binds it where it stands, and draws each material's triangles in turn", () => {
    expect.hasAssertions();

    const pmxMaterial: PmxMaterial = {
      diffuseColor: [0, 0, 0, 0],
      indexCount: 3,
      isDoubleSided: false,
      isOutlined: false,
      isToonShared: false,
      name: "",
      sphereMode: PmxSphereMode.Disabled,
      sphereTextureIndex: -1,
      textureIndex: -1,
      toonIndex: -1,
    };
    const pmxModel: PmxModel = {
      bones: [
        { name: "", parentIndex: -1, position: [1, 1, 1] },
        { name: "", parentIndex: 0, position: [2, 2, 2] },
      ],
      indices: new Uint32Array(6),
      joints: [],
      materials: [pmxMaterial, pmxMaterial],
      morphs: [],
      name: "",
      rigidBodies: [],
      textures: [],
      vertices: {
        normals: new Float32Array(),
        positions: new Float32Array(),
        skinIndices: new Uint16Array(),
        skinWeights: new Float32Array(),
        uvs: new Float32Array(),
      },
    };
    const mesh = createPmxMesh(pmxModel, [new MeshBasicMaterial(), new MeshBasicMaterial()]);
    const {
      geometry: { groups },
      skeleton: { boneInverses, bones },
    } = mesh;

    expect(groups).toStrictEqual([
      { count: 3, materialIndex: 0, start: 0 },
      { count: 3, materialIndex: 1, start: 3 },
    ]);
    expect(bones.map(({ parent }) => parent)).toStrictEqual([mesh, bones[0]]);
    expect(bones.map(({ position }) => position)).toStrictEqual([new Vector3(1, 1, 1), new Vector3(1, 1, 1)]);
    expect(boneInverses).toStrictEqual([
      new Matrix4().makeTranslation(-1, -1, -1),
      new Matrix4().makeTranslation(-2, -2, -2),
    ]);
  });
});
