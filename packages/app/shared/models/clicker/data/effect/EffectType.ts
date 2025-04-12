import type { Type } from "arktype";

import { type } from "arktype";

export enum EffectType {
  Additive = "Additive",
  // Adds value based on number of specific buildings we have
  BuildingAdditive = "BuildingAdditive",
  // Considers all buildings except for buildings we specify
  BuildingAdditiveNor = "BuildingAdditiveNor",
  Multiplicative = "Multiplicative",
}

export const effectTypeSchema = type.valueOf(EffectType) satisfies Type<EffectType>;
