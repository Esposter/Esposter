import type { PmxPhysicsMode } from "#src/models/character/PmxPhysicsMode";
import type { PmxReader } from "#src/models/character/PmxReader";
import type { PmxRigidBody } from "#src/models/character/PmxRigidBody";
import type { PmxRigidBodyShape } from "#src/models/character/PmxRigidBodyShape";

// A PMX file's rigid bodies, their places and turns mirrored into three's space as everything else the file holds
export const parsePmxRigidBodies = (reader: PmxReader): PmxRigidBody[] =>
  Array.from({ length: reader.readInt32() }, () => {
    const name = reader.readText();
    reader.readText();
    const boneIndex = reader.readBoneIndex();
    const group = reader.readUint8();
    const nonCollidingGroups = reader.readUint16();
    const shape: PmxRigidBodyShape = reader.readUint8();
    const size = reader.readVector3();
    const position = reader.readMirroredVector3();
    const rotation = reader.readMirroredRotation();
    const mass = reader.readFloat32();
    const linearDamping = reader.readFloat32();
    const angularDamping = reader.readFloat32();
    const restitution = reader.readFloat32();
    const friction = reader.readFloat32();
    const physicsMode: PmxPhysicsMode = reader.readUint8();
    return {
      angularDamping,
      boneIndex,
      friction,
      group,
      linearDamping,
      mass,
      name,
      nonCollidingGroups,
      physicsMode,
      position,
      restitution,
      rotation,
      shape,
      size,
    };
  });
