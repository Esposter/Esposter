import type { PmxMaterial } from "#src/models/character/PmxMaterial";
import type { PmxModel } from "#src/models/character/PmxModel";

import { createPmxMesh } from "#src/character/createPmxMesh";
import { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import { Matrix4, MeshBasicMaterial, Vector3 } from "three";
import { describe, expect, test } from "vitest";

// Rounds away the float noise of a matrix product, and turns a negative zero into zero for the comparison
const roundToTen = (value: number): number => Math.round(value * 1e6) / 1e6 + 0;

describe(createPmxMesh, () => {
  test("places each bone from its parent, binds it where it stands, and draws each material's triangles in turn", () => {
    expect.hasAssertions();

    const pmxMaterial: PmxMaterial = {
      ambientColor: [0, 0, 0],
      diffuseColor: [0, 0, 0, 0],
      edgeColor: [0, 0, 0, 0],
      edgeSize: 0,
      indexCount: 3,
      isDoubleSided: false,
      isOutlined: false,
      isToonShared: false,
      name: "",
      specularColor: [0, 0, 0],
      specularity: 0,
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
        subUvs: new Float32Array(),
        uvs: new Float32Array(),
      },
    };
    const mesh = createPmxMesh(pmxModel, [new MeshBasicMaterial(), new MeshBasicMaterial()], 0.5);
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
    // Each bone's rest skin, its world times its inverse, is the identity: a vertex the file places stays where it is
    expect(
      boneInverses.map((boneInverse, index) =>
        bones[index]?.matrixWorld
          .clone()
          .multiply(boneInverse)
          .elements.map((element) => roundToTen(element)),
      ),
    ).toStrictEqual([
      new Matrix4().elements.map((element) => roundToTen(element)),
      new Matrix4().elements.map((element) => roundToTen(element)),
    ]);
  });

  test("scales the mesh by the metres each unit stands for", () => {
    expect.hasAssertions();

    const pmxModel: PmxModel = {
      bones: [],
      indices: new Uint32Array(),
      joints: [],
      materials: [],
      morphs: [],
      name: "",
      rigidBodies: [],
      textures: [],
      vertices: {
        normals: new Float32Array(),
        positions: new Float32Array(),
        skinIndices: new Uint16Array(),
        skinWeights: new Float32Array(),
        subUvs: new Float32Array(),
        uvs: new Float32Array(),
      },
    };

    expect(createPmxMesh(pmxModel, [], 0.5).scale.x).toBe(0.5);
  });
});
