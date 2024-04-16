import { z } from "zod";

export const SoundEffectKey = {
  Claw: "Claw",
  Flee: "Flee",
  IceExplosion: "IceExplosion",
  StepGrass: "StepGrass",
  TextBlip: "TextBlip",
} as const;
export type SoundEffectKey = keyof typeof SoundEffectKey;

export const soundEffectKeySchema = z.nativeEnum(SoundEffectKey) satisfies z.ZodType<SoundEffectKey>;
