import { z } from "zod";

export enum SoundEffectKey {
  Claw = "Claw",
  Flee = "Flee",
  IceExplosion = "IceExplosion",
  StepGrass = "StepGrass",

  OpenChest = "OpenChest",
  OpenDoor = "OpenDoor",
  TextBlip = "TextBlip",
}

export const soundEffectKeySchema = z.nativeEnum(SoundEffectKey) satisfies z.ZodType<SoundEffectKey>;
