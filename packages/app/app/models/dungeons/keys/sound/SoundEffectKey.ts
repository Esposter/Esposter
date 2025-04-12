import type { Type } from "arktype";

import { type } from "arktype";

export enum SoundEffectKey {
  Claw = "Claw",
  Flee = "Flee",
  IceExplosion = "IceExplosion",
  OpenChest = "OpenChest",

  OpenDoor = "OpenDoor",
  StepGrass = "StepGrass",
  TextBlip = "TextBlip",
}

export const soundEffectKeySchema = type.valueOf(SoundEffectKey) satisfies Type<SoundEffectKey>;
