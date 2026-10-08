import { parsePmx } from "#src/character/parsePmx";
import { PmxBoneFlag } from "#src/models/character/PmxBoneFlag";
import { PmxJointKind } from "#src/models/character/PmxJointKind";
import { PmxMaterialFlag } from "#src/models/character/PmxMaterialFlag";
import { PmxMorphKind } from "#src/models/character/PmxMorphKind";
import { PmxPhysicsMode } from "#src/models/character/PmxPhysicsMode";
import { PmxRigidBodyShape } from "#src/models/character/PmxRigidBodyShape";
import { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import { PmxTextEncoding } from "#src/models/character/PmxTextEncoding";
import { PmxWeightDeform } from "#src/models/character/PmxWeightDeform";
import { describe, expect, test } from "vitest";

const getBytes = (byteLength: number, write: (view: DataView) => void): number[] => {
  const view = new DataView(new ArrayBuffer(byteLength));
  write(view);
  return [...new Uint8Array(view.buffer)];
};
const getInt8Bytes = (value: number): number[] =>
  getBytes(1, (view) => {
    view.setInt8(0, value);
  });
const getInt16Bytes = (value: number): number[] =>
  getBytes(2, (view) => {
    view.setInt16(0, value, true);
  });
const getInt32Bytes = (value: number): number[] =>
  getBytes(4, (view) => {
    view.setInt32(0, value, true);
  });
const getFloatBytes = (...values: number[]): number[] =>
  values.flatMap((value) =>
    getBytes(4, (view) => {
      view.setFloat32(0, value, true);
    }),
  );
// A text as UTF-16, the encoding PMX Editor saves in, behind its length in bytes
const getTextBytes = (text: string): number[] => {
  const textBytes = Buffer.from(text, "utf16le");
  return [...getInt32Bytes(textBytes.length), ...textBytes];
};

describe(parsePmx, () => {
  test("reads a model into three's space, passing over what it does not keep", () => {
    expect.hasAssertions();

    // A position and a normal along z, a texture coordinate and one extra vector
    const vertexBytes = getFloatBytes(0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0);
    const names = [...getTextBytes(""), ...getTextBytes("")];
    const bytes = [
      // The signature and the version, which are not read, then eight globals: UTF-16 text, one extra vector, and a
      // Vertex, texture, material, bone, morph and rigid body index of one, two, four, one, two and four bytes
      ...new Uint8Array(8),
      8,
      PmxTextEncoding.Utf16LittleEndian,
      1,
      1,
      2,
      4,
      1,
      2,
      4,
      ...getTextBytes(" "),
      ...getTextBytes(""),
      ...getTextBytes(""),
      ...getTextBytes(""),
      ...getInt32Bytes(4),
      ...vertexBytes,
      PmxWeightDeform.OneBone,
      1,
      ...getFloatBytes(0),
      ...vertexBytes,
      PmxWeightDeform.TwoBones,
      0,
      1,
      ...getFloatBytes(0.25, 0),
      ...vertexBytes,
      PmxWeightDeform.FourBones,
      0,
      1,
      ...getInt8Bytes(-1),
      ...getInt8Bytes(-1),
      ...getFloatBytes(0.5, 0.5, 0, 0, 0),
      ...vertexBytes,
      PmxWeightDeform.Spherical,
      1,
      0,
      ...getFloatBytes(0.25),
      ...new Uint8Array(36),
      ...getFloatBytes(0),
      ...getInt32Bytes(3),
      0,
      1,
      2,
      ...getInt32Bytes(1),
      ...getTextBytes(""),
      ...getInt32Bytes(1),
      ...names,
      ...getFloatBytes(0, 0, 0, 1),
      ...new Uint8Array(28),
      PmxMaterialFlag.Outlined,
      ...new Uint8Array(20),
      ...getInt16Bytes(0),
      ...getInt16Bytes(-1),
      PmxSphereMode.Disabled,
      1,
      0,
      ...getTextBytes(""),
      ...getInt32Bytes(3),
      ...getInt32Bytes(2),
      ...names,
      ...getFloatBytes(0, 0, 1),
      ...getInt8Bytes(-1),
      ...getInt32Bytes(0),
      ...getInt16Bytes(
        PmxBoneFlag.IndexedTail |
          PmxBoneFlag.InverseKinematics |
          PmxBoneFlag.InheritRotation |
          PmxBoneFlag.FixedAxis |
          PmxBoneFlag.LocalAxes |
          PmxBoneFlag.ExternalParent,
      ),
      1,
      0,
      ...new Uint8Array(4 + 12 + 24 + 4),
      1,
      ...new Uint8Array(8),
      ...getInt32Bytes(1),
      1,
      1,
      ...new Uint8Array(24),
      ...names,
      ...getFloatBytes(0, 1, 1),
      0,
      ...getInt32Bytes(0),
      ...getInt16Bytes(0),
      ...new Uint8Array(12),
      ...getInt32Bytes(4),
      ...names,
      0,
      PmxMorphKind.Vertex,
      ...getInt32Bytes(1),
      2,
      ...getFloatBytes(0, 0, 1),
      ...names,
      0,
      PmxMorphKind.Group,
      ...getInt32Bytes(1),
      ...getInt16Bytes(0),
      ...getFloatBytes(0.5),
      ...names,
      0,
      PmxMorphKind.Bone,
      ...getInt32Bytes(1),
      0,
      ...new Uint8Array(28),
      ...names,
      0,
      PmxMorphKind.Material,
      ...getInt32Bytes(1),
      ...getInt32Bytes(-1),
      ...new Uint8Array(113),
      ...getInt32Bytes(1),
      ...names,
      0,
      ...getInt32Bytes(2),
      0,
      0,
      1,
      ...getInt16Bytes(0),
      ...getInt32Bytes(1),
      ...names,
      0,
      1,
      ...getInt16Bytes(2),
      PmxRigidBodyShape.Capsule,
      ...getFloatBytes(1, 2, 3, 0, 0, 1, 1, 1, 0, 1, 2, 3, 4, 5),
      PmxPhysicsMode.Physics,
      ...getInt32Bytes(1),
      ...names,
      PmxJointKind.SpringSixDegreesOfFreedom,
      ...getInt32Bytes(0),
      ...getInt32Bytes(-1),
      ...getFloatBytes(0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 2, 1, 1, 0, 2, 2, 0, 1, 2, 3, 4, 5, 6),
    ];

    expect(parsePmx(Uint8Array.from(bytes).buffer)).toStrictEqual({
      bones: [
        { name: "", parentIndex: -1, position: [0, 0, -1] },
        { name: "", parentIndex: 0, position: [0, 1, -1] },
      ],
      indices: Uint32Array.of(2, 1, 0),
      joints: [
        {
          firstRigidBodyIndex: 0,
          kind: PmxJointKind.SpringSixDegreesOfFreedom,
          name: "",
          position: [0, 0, -1],
          rotation: [-1, -1, 0],
          rotationMaximum: [-1, -1, 0],
          rotationMinimum: [-2, -2, 0],
          rotationSpring: [4, 5, 6],
          secondRigidBodyIndex: -1,
          translationMaximum: [0, 0, -1],
          translationMinimum: [0, 0, -2],
          translationSpring: [1, 2, 3],
        },
      ],
      materials: [
        {
          diffuseColor: [0, 0, 0, 1],
          indexCount: 3,
          isDoubleSided: false,
          isOutlined: true,
          isToonShared: true,
          name: "",
          sphereMode: PmxSphereMode.Disabled,
          sphereTextureIndex: -1,
          textureIndex: 0,
          toonIndex: 0,
        },
      ],
      morphs: [
        { indices: Uint32Array.of(2), kind: PmxMorphKind.Vertex, name: "", values: Float32Array.of(0, 0, -1) },
        { indices: Uint32Array.of(0), kind: PmxMorphKind.Group, name: "", values: Float32Array.of(0.5) },
        { indices: new Uint32Array(), kind: PmxMorphKind.Bone, name: "", values: new Float32Array() },
        { indices: new Uint32Array(), kind: PmxMorphKind.Material, name: "", values: new Float32Array() },
      ],
      name: " ",
      rigidBodies: [
        {
          angularDamping: 3,
          boneIndex: 0,
          friction: 5,
          group: 1,
          linearDamping: 2,
          mass: 1,
          name: "",
          nonCollidingGroups: 2,
          physicsMode: PmxPhysicsMode.Physics,
          position: [0, 0, -1],
          restitution: 4,
          rotation: [-1, -1, 0],
          shape: PmxRigidBodyShape.Capsule,
          size: [1, 2, 3],
        },
      ],
      textures: [""],
      vertices: {
        normals: Float32Array.of(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1),
        positions: Float32Array.of(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1),
        skinIndices: Uint16Array.of(1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0),
        skinWeights: Float32Array.of(1, 0, 0, 0, 0.25, 0.75, 0, 0, 0.5, 0.5, 0, 0, 0.25, 0.75, 0, 0),
        uvs: Float32Array.of(0, 1, 0, 1, 0, 1, 0, 1),
      },
    });
  });
});
