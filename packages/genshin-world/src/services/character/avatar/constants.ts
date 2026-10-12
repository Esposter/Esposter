import type { Vector3Tuple } from "three";

import { MmdBoneName } from "genshin-engine";

// The export component holding the Traveler's game model, which the scene draws in place of the pack's, in development
export const AVATAR_COMPONENT = "playergirl";
// The export folder of a component's textures, which each texture slot's file is read from: the route serves a file
// Below the component's assets by its export folder, as a witness's meshes and textures are
// The one slot a texture is a colour in. Every other slot is data, read as it is stored
export const AVATAR_COLOUR_TEXTURE_SLOT = "_MainTex";
export const AVATAR_TEXTURE_FOLDER = "Texture2D";
// The texture slots a material's shading reads, by the game's property names
export const AVATAR_TEXTURE_SLOTS = [
  "_FaceMapTex",
  "_LightMapTex",
  "_MTMap",
  "_MainTex",
  "_PackedShadowRampTex",
] as const;
// The MMD bone each Unity humanoid bone stands in for, given to the bone as its name so the poser's name map finds it.
// Center has no humanoid counterpart, so the pose leaves it to the rig
export const AVATAR_HUMANOID_MMD_NAME_MAP: Partial<Record<string, MmdBoneName>> = {
  Chest: MmdBoneName.Upper2,
  Head: MmdBoneName.Head,
  Hips: MmdBoneName.Lower,
  LeftFoot: MmdBoneName.LeftAnkle,
  LeftHand: MmdBoneName.LeftWrist,
  LeftLowerArm: MmdBoneName.LeftElbow,
  LeftLowerLeg: MmdBoneName.LeftKnee,
  LeftShoulder: MmdBoneName.LeftShoulder,
  LeftUpperArm: MmdBoneName.LeftArm,
  LeftUpperLeg: MmdBoneName.LeftLeg,
  Neck: MmdBoneName.Neck,
  RightFoot: MmdBoneName.RightAnkle,
  RightHand: MmdBoneName.RightWrist,
  RightLowerArm: MmdBoneName.RightElbow,
  RightLowerLeg: MmdBoneName.RightKnee,
  RightShoulder: MmdBoneName.RightShoulder,
  RightUpperArm: MmdBoneName.RightArm,
  RightUpperLeg: MmdBoneName.RightLeg,
  Spine: MmdBoneName.Upper,
};
// Each arm chain of the pack's rest, the humanoid names of its upper arm and lower arm and the direction its upper arm
// Rests in, from its shoulder to its elbow, in the pack's own axes. Measured from Lumine's pack, whose 左腕 to 左ひじ and
// 右腕 to 右ひじ are the PMX file's own bones, so the model's arms rest where the pack's do, and the poser's deltas hold
export const PACK_ARM_REST_CHAINS: readonly { direction: Vector3Tuple; lowerArm: string; upperArm: string }[] = [
  {
    direction: [0.7619042486102005, -0.647386881314609, -0.019802571839794402],
    lowerArm: "LeftLowerArm",
    upperArm: "LeftUpperArm",
  },
  {
    direction: [-0.7619042486102005, -0.647386881314609, -0.019802571839794402],
    lowerArm: "RightLowerArm",
    upperArm: "RightUpperArm",
  },
];
