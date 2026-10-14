import type { CharacterBoneNameMap } from "#src/models/character/CharacterBoneNameMap";
import type { Locomotion } from "#src/models/locomotion/Locomotion";
import type { LocomotionPhase } from "#src/models/locomotion/LocomotionPhase";
import type { SkinnedMesh } from "three";

import { advanceStridePhase } from "#src/character/pose/advanceStridePhase";
import { computeCharacterPose } from "#src/character/pose/computeCharacterPose";
import { MMD_BONE_NAME_MAP, POSE_ARM_CHAINS, POSE_CROSSFADE_SECONDS, POSE_GAITS } from "#src/character/pose/constants";
import { createCharacterPoseRotations } from "#src/character/pose/createCharacterPoseRotations";
import { MmdBoneName } from "#src/models/character/MmdBoneName";
import { LocomotionState } from "#src/models/locomotion/LocomotionState";
import { Bone, Quaternion, Vector3 } from "three";

export interface CharacterPoser {
  update: (update: CharacterPoseUpdate) => void;
}
interface CharacterPoseUpdate {
  delta: number;
  locomotion: Locomotion;
  phase: LocomotionPhase;
}
interface PosedBone {
  bone: Bone;
  name: MmdBoneName;
  // The bone's rest world rotation, and its parent's rest taken out of the pose, which a local rotation is written from
  rest: Quaternion;
  restParentInverse: Quaternion;
  // Written each frame in place, the bone's local rotation the pose asks for before the cross-fade
  target: Quaternion;
}
// A bone's rest world rotation, read up its fathers from the rest pose the bones hold when the poser is made, turned by
// The raise of the arm it is or hangs from, so an arm's chain rests in the T its pose is lowered from
const getRestWorldRotation = (bone: Bone, armRaises: ReadonlyMap<Bone, Quaternion>): Quaternion => {
  const rotation = new Quaternion();
  let raise: Quaternion | undefined;
  for (let father: Bone["parent"] = bone; father instanceof Bone; father = father.parent) {
    rotation.premultiply(father.quaternion);
    raise ??= armRaises.get(father);
  }
  return raise ? rotation.premultiply(raise) : rotation;
};
// A bone's rest position in the skeleton's frame, carried up its fathers as each one's scale, rotation and offset place it
const getRestPosition = (bone: Bone): Vector3 => {
  const position = bone.position.clone();
  for (let father = bone.parent; father instanceof Bone; father = father.parent)
    position.multiply(father.scale).applyQuaternion(father.quaternion).add(father.position);
  return position;
};

// The state's speed the stride is matched to, from the body's own locomotion, so a stride's feet keep pace with the ground
const getGaitSpeed = (state: LocomotionState, { dashSpeed, runSpeed, sprintSpeed, walkSpeed }: Locomotion): number => {
  if (state === LocomotionState.Walk) return walkSpeed;
  else if (state === LocomotionState.Run) return runSpeed;
  else if (state === LocomotionState.Sprint) return sprintSpeed;
  else return dashSpeed;
};
// Smoothstep over the cross-fade's share of its time, so a pose eases out of the one before it
const getCrossfadeWeight = (stateSeconds: number): number => {
  const share = Math.min(1, stateSeconds / POSE_CROSSFADE_SECONDS);
  return share * share * (3 - 2 * share);
};

// Drives a model's standard bones from its body's state, once per frame. The pose is written in each bone's rest frame,
// So a model whose bones rest turned, as the game's do, holds the same pose as a PMX model whose rests are the identity,
// And each arm's rest is taken raised to the T, so a model resting in an A-pose holds the same pose as one in the T.
// The name map gives each standard bone its model's own bone, and a bone the model lacks is skipped. A state's pose
// Cross-fades from the pose the bones held when the state began. The rotations and the targets are allocated once, and
// The frame writes the bones in place, so no frame allocates a quaternion
export const createCharacterPoser = (
  skinnedMesh: SkinnedMesh,
  boneNameMap: CharacterBoneNameMap = MMD_BONE_NAME_MAP,
): CharacterPoser => {
  const findBone = (name: MmdBoneName): Bone | undefined => {
    const boneName = boneNameMap[name];
    return boneName === undefined ? undefined : skinnedMesh.skeleton.getBoneByName(boneName);
  };
  // The turn about each shoulder that lays its elbow along the T, read once from where the rest pose holds the two
  const armRaises = new Map<Bone, Quaternion>();
  for (const { arm, elbow, tDirection } of POSE_ARM_CHAINS) {
    const armBone = findBone(arm);
    const elbowBone = findBone(elbow);
    if (!armBone || !elbowBone) continue;
    const restDirection = getRestPosition(elbowBone).sub(getRestPosition(armBone)).normalize();
    armRaises.set(armBone, new Quaternion().setFromUnitVectors(restDirection, new Vector3(...tDirection)));
  }
  const posedBones: PosedBone[] = [];
  for (const name of Object.values(MmdBoneName)) {
    const bone = findBone(name);
    if (!bone) continue;
    const restParentInverse =
      bone.parent instanceof Bone ? getRestWorldRotation(bone.parent, armRaises).invert() : new Quaternion();
    posedBones.push({
      bone,
      name,
      rest: getRestWorldRotation(bone, armRaises),
      restParentInverse,
      target: new Quaternion(),
    });
  }
  const rotations = createCharacterPoseRotations();
  const fromRotations = createCharacterPoseRotations();
  let elapsed = 0;
  let previousState: LocomotionState | undefined;
  let stridePhase = 0;
  return {
    update: ({ delta, locomotion, phase: { state, stateSeconds } }) => {
      if (state !== previousState) {
        for (const { bone, name } of posedBones) fromRotations[name].copy(bone.quaternion);
        previousState = state;
      }
      elapsed += delta;
      const gait = POSE_GAITS[state];
      if (gait)
        stridePhase = advanceStridePhase(stridePhase, getGaitSpeed(state, locomotion), gait.strideMetres, delta);
      computeCharacterPose({ elapsed, state, stridePhase }, rotations);
      const weight = getCrossfadeWeight(stateSeconds);
      for (const { bone, name, rest, restParentInverse, target } of posedBones) {
        target.copy(restParentInverse).multiply(rotations[name]).multiply(rest);
        bone.quaternion.copy(fromRotations[name]).slerp(target, weight);
      }
    },
  };
};
