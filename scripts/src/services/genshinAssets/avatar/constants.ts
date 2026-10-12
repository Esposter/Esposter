import type { AvatarSource } from "#src/models/genshinAssets/avatar/AvatarSource";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

// The components with an avatar, by the Avatar asset their model's rig is exported from. Lumine's is the ModelAvatar
// Beside her body's textures; the meshes she draws are the LOD0 renderers of her model's object tree
export const AVATAR_SOURCE_MAP: Partial<Record<DerivedAssetComponent, AvatarSource>> = {
  [DerivedAssetComponent.PlayerGirl]: { block: "00/04161624.blk", name: "Avatar_Girl_Sword_PlayerGirl_ModelAvatar" },
};
// The rig's root bone, the hips every path in a rig begins at, as the layout and the rig both name it
export const RIG_ROOT_BONE_NAME = "Bip001";
// Unity's humanoid bone names in the order a rig's humanoid map indexes them, as Mecanim keeps them
export const HUMANOID_BONE_NAMES: readonly string[] = [
  "Hips",
  "LeftUpperLeg",
  "RightUpperLeg",
  "LeftLowerLeg",
  "RightLowerLeg",
  "LeftFoot",
  "RightFoot",
  "Spine",
  "Chest",
  "UpperChest",
  "Neck",
  "Head",
  "LeftShoulder",
  "RightShoulder",
  "LeftUpperArm",
  "RightUpperArm",
  "LeftLowerArm",
  "RightLowerArm",
  "LeftHand",
  "RightHand",
  "LeftToes",
  "RightToes",
  "LeftEye",
  "RightEye",
  "Jaw",
];
