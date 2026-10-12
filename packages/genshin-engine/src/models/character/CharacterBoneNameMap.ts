import type { MmdBoneName } from "#src/models/character/MmdBoneName";

// The model's own bone that each standard MMD bone drives, by its name in the model's skeleton. A bone the model has no
// Counterpart for is left out, and the pose skips it
export type CharacterBoneNameMap = Partial<Record<MmdBoneName, string>>;
