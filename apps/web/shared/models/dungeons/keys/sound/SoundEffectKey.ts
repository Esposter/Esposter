export const SoundEffectKey = {
  Claw: "Claw",
  Flee: "Flee",
  IceExplosion: "IceExplosion",
  OpenChest: "OpenChest",
  OpenDoor: "OpenDoor",
  StepGrass: "StepGrass",
  TextBlip: "TextBlip",
} as const;
export type SoundEffectKey = (typeof SoundEffectKey)[keyof typeof SoundEffectKey];
