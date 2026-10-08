import type { PmxReader } from "#src/models/character/PmxReader";
import type { PmxVertices } from "#src/models/character/PmxVertices";

import { PmxWeightDeform } from "#src/models/character/PmxWeightDeform";

const PmxWeightDeformBoneCountMap: Record<PmxWeightDeform, number> = {
  [PmxWeightDeform.DualQuaternion]: 4,
  [PmxWeightDeform.FourBones]: 4,
  [PmxWeightDeform.OneBone]: 1,
  [PmxWeightDeform.Spherical]: 2,
  [PmxWeightDeform.TwoBones]: 2,
};
// A PMX file's vertices, each bound to up to four bones: one bone takes all of its weight, two share it by the first
// One's weight and four by their own. Three's skinning blends linearly, so a spherical blend is read as its two bones'
// Linear one, its centre and reference points passed over, and a dual quaternion blend as its four bones' linear one. A
// Slot a file leaves unused names no bone, -1, and is bound to the first at the weight of none the file gives it
export const parsePmxVertices = (reader: PmxReader): PmxVertices => {
  const vertexCount = reader.readInt32();
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const skinIndices = new Uint16Array(vertexCount * 4);
  const skinWeights = new Float32Array(vertexCount * 4);
  for (let vertex = 0; vertex < vertexCount; vertex++) {
    reader.readMirroredVector3Into(positions, vertex * 3);
    reader.readMirroredVector3Into(normals, vertex * 3);
    uvs[vertex * 2] = reader.readFloat32();
    uvs[vertex * 2 + 1] = reader.readFloat32();
    // Its extra vectors, four floats each
    reader.skip(reader.additionalVectorCount * 16);
    const skinOffset = vertex * 4;
    const weightDeform: PmxWeightDeform = reader.readUint8();
    const boneCount = PmxWeightDeformBoneCountMap[weightDeform];
    for (let slot = 0; slot < boneCount; slot++) skinIndices[skinOffset + slot] = Math.max(reader.readBoneIndex(), 0);
    if (boneCount === 1) skinWeights[skinOffset] = 1;
    else if (boneCount === 2) {
      const weight = reader.readFloat32();
      skinWeights[skinOffset] = weight;
      skinWeights[skinOffset + 1] = 1 - weight;
    } else for (let slot = 0; slot < boneCount; slot++) skinWeights[skinOffset + slot] = reader.readFloat32();
    // The spherical blend's centre and its two reference points
    if (weightDeform === PmxWeightDeform.Spherical) reader.skip(36);
    // Its edge's scale, which the outline pass's one width stands in for
    reader.skip(4);
  }

  return { normals, positions, skinIndices, skinWeights, uvs };
};
