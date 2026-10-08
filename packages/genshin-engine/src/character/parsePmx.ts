import type { PmxModel } from "#src/models/character/PmxModel";

import { parsePmxBones } from "#src/character/parsePmxBones";
import { parsePmxJoints } from "#src/character/parsePmxJoints";
import { parsePmxMaterials } from "#src/character/parsePmxMaterials";
import { parsePmxMorphs } from "#src/character/parsePmxMorphs";
import { parsePmxRigidBodies } from "#src/character/parsePmxRigidBodies";
import { parsePmxVertices } from "#src/character/parsePmxVertices";
import { PmxReader } from "#src/models/character/PmxReader";

// An MMD model from its PMX file, version 2.0 or 2.1, read section by section in the file's order and turned into
// Three's right-handed space: z mirrored, which turns each triangle's winding round as well. Its comments and every
// Name in English are passed over, as are its display frames, which list bones and morphs for MMD's own panels, and a
// Version 2.1 file's soft bodies, which follow everything read
export const parsePmx = (buffer: ArrayBuffer): PmxModel => {
  const reader = new PmxReader(buffer);
  const name = reader.readText();
  reader.readText();
  reader.readText();
  reader.readText();
  const vertices = parsePmxVertices(reader);
  const indexCount = reader.readInt32();
  const indices = new Uint32Array(indexCount);
  for (let index = 0; index < indexCount; index += 3) {
    indices[index + 2] = reader.readVertexIndex();
    indices[index + 1] = reader.readVertexIndex();
    indices[index] = reader.readVertexIndex();
  }

  const textures = Array.from({ length: reader.readInt32() }, () => reader.readText());
  const materials = parsePmxMaterials(reader);
  const bones = parsePmxBones(reader);
  const morphs = parsePmxMorphs(reader);
  const displayFrameCount = reader.readInt32();
  for (let displayFrame = 0; displayFrame < displayFrameCount; displayFrame++) {
    reader.readText();
    reader.readText();
    // Whether MMD treats it as special
    reader.readUint8();
    const entryCount = reader.readInt32();
    // Each entry a bone or a morph, by its kind's byte
    for (let entry = 0; entry < entryCount; entry++)
      if (reader.readUint8()) reader.readMorphIndex();
      else reader.readBoneIndex();
  }

  const rigidBodies = parsePmxRigidBodies(reader);
  const joints = parsePmxJoints(reader);
  return { bones, indices, joints, materials, morphs, name, rigidBodies, textures, vertices };
};
