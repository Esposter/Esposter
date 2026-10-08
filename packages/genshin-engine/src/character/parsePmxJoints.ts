import type { PmxJoint } from "#src/models/character/PmxJoint";
import type { PmxJointKind } from "#src/models/character/PmxJointKind";
import type { PmxReader } from "#src/models/character/PmxReader";

// A PMX file's joints, mirrored into three's space. Mirroring turns a range round as well as a place: a translation's
// Least and most along z become its most and least negated, and a rotation's about x and y likewise
export const parsePmxJoints = (reader: PmxReader): PmxJoint[] =>
  Array.from({ length: reader.readInt32() }, () => {
    const name = reader.readText();
    reader.readText();
    const kind: PmxJointKind = reader.readUint8();
    const firstRigidBodyIndex = reader.readRigidBodyIndex();
    const secondRigidBodyIndex = reader.readRigidBodyIndex();
    const position = reader.readMirroredVector3();
    const rotation = reader.readMirroredRotation();
    const [translationMinimumX, translationMinimumY, translationMinimumZ] = reader.readVector3();
    const [translationMaximumX, translationMaximumY, translationMaximumZ] = reader.readVector3();
    const [rotationMinimumX, rotationMinimumY, rotationMinimumZ] = reader.readVector3();
    const [rotationMaximumX, rotationMaximumY, rotationMaximumZ] = reader.readVector3();
    const translationSpring = reader.readVector3();
    const rotationSpring = reader.readVector3();
    return {
      firstRigidBodyIndex,
      kind,
      name,
      position,
      rotation,
      rotationMaximum: [-rotationMinimumX, -rotationMinimumY, rotationMaximumZ],
      rotationMinimum: [-rotationMaximumX, -rotationMaximumY, rotationMinimumZ],
      rotationSpring,
      secondRigidBodyIndex,
      translationMaximum: [translationMaximumX, translationMaximumY, -translationMinimumZ],
      translationMinimum: [translationMinimumX, translationMinimumY, -translationMaximumZ],
      translationSpring,
    };
  });
