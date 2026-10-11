import type { BodyAvatar } from "#src/models/genshinAssets/locomotion/BodyAvatar";

// The clips of a body type's movement the controller's numbers are read off, by the action that ends each clip's name:
// The walk, the run and the sprint, the dash that starts a sprint, the jump, the climb and its jump, the swim, its dash,
// Drowning, and the glide
export const LOCOMOTION_CLIP_ACTIONS: readonly string[] = [
  "WalkCycle",
  "RunCycle",
  "SprintCycle",
  "SprintBS",
  "Jump",
  "ClimbU",
  "ClimbDashU",
  "SwimF",
  "SwimDash",
  "SwimDie",
  "FlyNormal",
];
// A character's avatar of each body type, by the body's name in the clip names, whose human scale the body's clips are
// Scaled by. Each was found by exporting the avatars of the blocks holding characters' body textures: every character
// Of a body reads the same scale within 0.01%, but for Nod-Krai's rigs, 0.25% over for the medium female body and 1.1%
// For the tall male's
export const BodyAvatarMap: Record<string, BodyAvatar> = {
  Boy: { block: "00/00637927.blk", name: "Avatar_Boy_Pole_Mika_ModelAvatar" },
  Girl: { block: "00/10413193.blk", name: "Avatar_Girl_Sword_Ayaka_ModelAvatar" },
  Lady: { block: "00/10413193.blk", name: "Avatar_Lady_Sword_Qin_ModelAvatar" },
  Loli: { block: "00/06176477.blk", name: "Avatar_Loli_Bow_Sigewinne_ModelAvatar" },
  Male: { block: "00/12774345.blk", name: "Avatar_Male_Catalyst_Neuvillette_ModelAvatar" },
};
