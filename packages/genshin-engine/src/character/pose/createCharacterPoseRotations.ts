import type { CharacterPoseRotations } from "#src/models/character/CharacterPoseRotations";

import { MmdBoneName } from "#src/models/character/MmdBoneName";
import { Quaternion } from "three";

// One quaternion for each standard bone, allocated once and reused by every frame's pose
export const createCharacterPoseRotations = (): CharacterPoseRotations =>
  Object.fromEntries(Object.values(MmdBoneName).map((name) => [name, new Quaternion()])) as CharacterPoseRotations;
