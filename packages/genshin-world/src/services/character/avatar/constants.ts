import { MmdBoneName } from "genshin-engine";

// The export component holding the Traveler's game model, which the scene draws in place of the pack's, in development
export const AVATAR_COMPONENT = "playergirl";
// The export folder of a component's textures, which each texture slot's file is read from: the route serves a file
// Below the component's assets by its export folder, as a witness's meshes and textures are
export const AVATAR_TEXTURE_FOLDER = "Texture2D";
// The texture slots a material's shading reads, by the game's property names. A colour slot's texture decodes as sRGB, since
// The shading multiplies its colour in the space the colour lives in; a data slot's texture is read as it is stored, since
// Its values are thresholds, distances or channels. Derived from the program's use of each sample, Provisional until a frame
export const AVATAR_TEXTURE_SLOTS = [
  { isColour: false, slot: "_FaceMapTex" },
  { isColour: false, slot: "_LightMapTex" },
  { isColour: true, slot: "_MTMap" },
  { isColour: true, slot: "_MainTex" },
  { isColour: true, slot: "_PackedShadowRampTex" },
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
