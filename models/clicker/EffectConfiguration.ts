import { effectTypeSchema, type EffectType } from "@/models/clicker/EffectType";
import { targetSchema, type Target } from "@/models/clicker/Target";
import { z } from "zod";

export interface EffectConfiguration {
  type: EffectType;
  // Only used for effect types that are based off other specific targets
  // e.g. BuildingAdditive requires number of buildings (targets)
  targets?: Target[];
}

export const effectConfigurationSchema = z.object({
  type: effectTypeSchema,
  targets: z.array(targetSchema).optional(),
}) satisfies z.ZodType<EffectConfiguration>;
