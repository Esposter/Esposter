import type { AvatarManifest } from "#src/models/avatar/AvatarManifest";

import { createCharacterAvatar } from "#src/services/character/avatar/createCharacterAvatar";
import { createLightUniforms, MmdBoneName } from "genshin-engine";
import { DataTexture } from "three";
import { describe, expect, test } from "vitest";

// A one-triangle body of two bones, the second the humanoid's hips, laid out in a binary as the writer lays one out
const createFixture = () => {
  const buffer = new ArrayBuffer(224);
  const floats = new Float32Array(buffer, 0, 9);
  floats.set([0, 0, 0, 1, 0, 0, 0, 1, 0]);
  const manifest: AvatarManifest = {
    bones: [
      { name: "Bip001", parent: -1, position: [0, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] },
      { name: "Bone_Hips", parent: 0, position: [0, 1, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] },
    ],
    humanoid: { Hips: 1 },
    materials: {
      Body: {
        colors: {
          _Color: [1, 1, 1, 1],
          _Color2: [1, 1, 1, 1],
          _Color3: [1, 1, 1, 1],
          _Color4: [1, 1, 1, 1],
          _Color5: [1, 1, 1, 1],
        },
        floats: {},
        keywords: [],
        textures: {},
      },
    },
    meshes: [
      {
        colors: { length: 0, offset: 0 },
        indices: { isUint32: false, length: 3, offset: 216 },
        joints: { length: 12, offset: 144 },
        name: "Body",
        normals: { length: 9, offset: 36 },
        positions: { length: 9, offset: 0 },
        rootBone: 1,
        submeshes: [{ count: 3, material: "Body", start: 0 }],
        tangents: { length: 12, offset: 72 },
        uvs: { length: 6, offset: 120 },
        weights: { length: 12, offset: 168 },
      },
    ],
  };
  return { buffer, manifest };
};

describe("createCharacterAvatar", () => {
  test("names the humanoid bones for the pose and reads the mesh over the binary without a copy", () => {
    expect.assertions(2);
    const { buffer, manifest } = createFixture();
    const { skinnedMeshes } = createCharacterAvatar(manifest, buffer, new Map(), {
      lightUniforms: createLightUniforms(),
      rampTexture: new DataTexture(),
    });
    const [skinnedMesh] = skinnedMeshes;
    expect(skinnedMesh?.skeleton.bones.map(({ name }) => name)).toStrictEqual(["Bip001", MmdBoneName.Lower]);
    expect(skinnedMesh?.geometry.getAttribute("position").array.buffer).toBe(buffer);
  });
});
