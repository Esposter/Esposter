import { z } from "zod";

export enum EffectType {
  Additive = "Additive",
  // Adds value based on number of specific buildings we have
  BuildingAdditive = "BuildingAdditive",
  // Considers all buildings except for buildings we specify
  BuildingAdditiveNor = "BuildingAdditiveNor",
  Multiplicative = "Multiplicative",
}

export const effectTypeSchema = z.nativeEnum(EffectType) satisfies z.ZodType<EffectType>;
