import type { PmxMorph } from "#src/models/character/PmxMorph";
import type { PmxReader } from "#src/models/character/PmxReader";

import { PmxMorphKind } from "#src/models/character/PmxMorphKind";

// The bytes each offset of a morph passed over takes, by its kind: a bone morph's bone, translation and rotation, a
// Texture coordinate morph's vertex and four floats, a material morph's material, operation byte and twenty-eight floats
// Of colours and tints, a flip morph's morph and influence, and an impulse morph's rigid body, local flag, velocity and
// Torque
const PmxMorphKindOffsetSizeMap: Record<
  Exclude<PmxMorphKind, PmxMorphKind.Group | PmxMorphKind.Vertex>,
  (reader: PmxReader) => number
> = {
  [PmxMorphKind.AdditionalUv1]: ({ vertexIndexSize }) => vertexIndexSize + 16,
  [PmxMorphKind.AdditionalUv2]: ({ vertexIndexSize }) => vertexIndexSize + 16,
  [PmxMorphKind.AdditionalUv3]: ({ vertexIndexSize }) => vertexIndexSize + 16,
  [PmxMorphKind.AdditionalUv4]: ({ vertexIndexSize }) => vertexIndexSize + 16,
  [PmxMorphKind.Bone]: ({ boneIndexSize }) => boneIndexSize + 28,
  [PmxMorphKind.Flip]: ({ morphIndexSize }) => morphIndexSize + 4,
  [PmxMorphKind.Impulse]: ({ rigidBodyIndexSize }) => rigidBodyIndexSize + 25,
  [PmxMorphKind.Material]: ({ materialIndexSize }) => materialIndexSize + 113,
  [PmxMorphKind.Uv]: ({ vertexIndexSize }) => vertexIndexSize + 16,
};
// A PMX file's morphs, each kept in its place so a group morph's members index the whole list. A vertex morph's offsets
// And a group morph's members are read; any other kind's offsets are passed over by their size
export const parsePmxMorphs = (reader: PmxReader): PmxMorph[] =>
  Array.from({ length: reader.readInt32() }, () => {
    const name = reader.readText();
    reader.readText();
    // The panel MMD lists it under
    reader.readUint8();
    const kind: PmxMorphKind = reader.readUint8();
    const offsetCount = reader.readInt32();
    if (kind === PmxMorphKind.Group) {
      const indices = new Uint32Array(offsetCount);
      const values = new Float32Array(offsetCount);
      for (let offset = 0; offset < offsetCount; offset++) {
        indices[offset] = reader.readMorphIndex();
        values[offset] = reader.readFloat32();
      }

      return { indices, kind, name, values };
    } else if (kind === PmxMorphKind.Vertex) {
      const indices = new Uint32Array(offsetCount);
      const values = new Float32Array(offsetCount * 3);
      for (let offset = 0; offset < offsetCount; offset++) {
        indices[offset] = reader.readVertexIndex();
        reader.readMirroredVector3Into(values, offset * 3);
      }

      return { indices, kind, name, values };
    }

    const offsetSize = PmxMorphKindOffsetSizeMap[kind](reader);
    reader.skip(offsetCount * offsetSize);
    return { indices: new Uint32Array(), kind, name, values: new Float32Array() };
  });
