import type { MmdBoneName } from "#src/models/character/MmdBoneName";
import type { Quaternion } from "three";

// Each of the standard bones' local rotation, identity standing for its rest. The pose writes these in place
export type CharacterPoseRotations = Record<MmdBoneName, Quaternion>;
