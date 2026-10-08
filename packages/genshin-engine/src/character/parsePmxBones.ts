import type { PmxBone } from "#src/models/character/PmxBone";
import type { PmxReader } from "#src/models/character/PmxReader";

import { PmxBoneFlag } from "#src/models/character/PmxBoneFlag";

// A PMX file's bones: each one's name, place and parent are kept, and every field its flags say it holds past them is
// Passed over, its tail, inherited motion, axes, external parent and inverse kinematics chain, which posing a bone from
// The world's own motion has no use for
export const parsePmxBones = (reader: PmxReader): PmxBone[] =>
  Array.from({ length: reader.readInt32() }, () => {
    const name = reader.readText();
    reader.readText();
    const position = reader.readMirroredVector3();
    const parentIndex = reader.readBoneIndex();
    // The layer it deforms in
    reader.skip(4);
    const flags = reader.readUint16();
    if (flags & PmxBoneFlag.IndexedTail) reader.readBoneIndex();
    else reader.skip(12);
    if (flags & (PmxBoneFlag.InheritRotation | PmxBoneFlag.InheritTranslation)) {
      reader.readBoneIndex();
      // The share inherited
      reader.skip(4);
    }

    if (flags & PmxBoneFlag.FixedAxis) reader.skip(12);
    if (flags & PmxBoneFlag.LocalAxes) reader.skip(24);
    if (flags & PmxBoneFlag.ExternalParent) reader.skip(4);
    if (flags & PmxBoneFlag.InverseKinematics) {
      reader.readBoneIndex();
      // The loop count and the angle each step is limited to
      reader.skip(8);
      const linkCount = reader.readInt32();
      for (let link = 0; link < linkCount; link++) {
        reader.readBoneIndex();
        // A link's limits, its least and its most angle on each axis
        if (reader.readUint8()) reader.skip(24);
      }
    }

    return { name, parentIndex, position };
  });
