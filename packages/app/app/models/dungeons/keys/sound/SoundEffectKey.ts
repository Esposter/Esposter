import { z } from "zod";

export enum SoundEffectKey {
  Claw = "Claw",
  Flee = "Flee",
  IceExplosion = "IceExplosion",
  OpenChest = "OpenChest",

  OpenDoor = "OpenDoor",
  StepGrass = "StepGrass",
  TextBlip = "TextBlip",
}

export const soundEffectKeySchema = z.enum(SoundEffectKey) satisfies z.ZodType<SoundEffectKey>;
