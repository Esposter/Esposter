import { MmdBoneName } from "genshin-engine";

// The export component holding the Traveler's game model, which the scene draws in place of the pack's, in development
export const AVATAR_COMPONENT = "playergirl";
// The export folder of a component's textures, which each texture slot's file is read from: the route serves a file
// Below the component's assets by its export folder, as a witness's meshes and textures are
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
