import type { CharacterPoseRotations } from "#src/models/character/CharacterPoseRotations";
import type { Locomotion } from "#src/models/locomotion/Locomotion";
import type { LocomotionPhase } from "#src/models/locomotion/LocomotionPhase";
import type { Bone, SkinnedMesh } from "three";

import { advanceStridePhase } from "#src/character/pose/advanceStridePhase";
import { computeCharacterPose } from "#src/character/pose/computeCharacterPose";
import { POSE_CROSSFADE_SECONDS, POSE_GAITS } from "#src/character/pose/constants";
import { createCharacterPoseRotations } from "#src/character/pose/createCharacterPoseRotations";
import { MmdBoneName } from "#src/models/character/MmdBoneName";
import { LocomotionState } from "#src/models/locomotion/LocomotionState";

export interface CharacterPoser {
  update: (update: CharacterPoseUpdate) => void;
}
export interface CharacterPoseUpdate {
  delta: number;
  locomotion: Locomotion;
  phase: LocomotionPhase;
}
interface PosedBone {
  bone: Bone;
  name: MmdBoneName;
}

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

// Drives a PMX model's standard bones from its body's state, once per frame. A state's pose cross-fades from the pose
// the bones held when the state began, and a bone the model does not have is skipped. The rotations and the cross-fade
// origin are allocated once, and the frame writes the bones in place, so no frame allocates a quaternion
export const createCharacterPoser = (skinnedMesh: SkinnedMesh): CharacterPoser => {
  const posedBones: PosedBone[] = [];
  for (const name of Object.values(MmdBoneName)) {
    const bone = skinnedMesh.skeleton.getBoneByName(name);
    if (bone) posedBones.push({ bone, name });
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
      for (const { bone, name } of posedBones) bone.quaternion.copy(fromRotations[name]).slerp(rotations[name], weight);
    },
  };
};
