import { ExpeditionPassiveKind } from "#src/models/expedition/ExpeditionPassiveKind";
import { ExpeditionRegion } from "#src/models/expedition/ExpeditionRegion";
import { z } from "zod";

// A utility passive whose description names an expedition, by the proud skill group it belongs to: a time talent shortens
// The expedition sent to its region by its percent, and a reward talent adds that percent to the rewards of the one sent to
// Its region for its hours. A time talent names no hours
export interface ExpeditionPassive {
  hours?: number;
  kind: ExpeditionPassiveKind;
  percent: number;
  proudSkillGroupId: number;
  region: ExpeditionRegion;
}

export const expeditionPassiveSchema = z.object({
  hours: z.int().positive().optional(),
  kind: z.enum(ExpeditionPassiveKind) satisfies z.ZodType<ExpeditionPassiveKind>,
  percent: z.int().positive(),
  proudSkillGroupId: z.int().positive(),
  region: z.enum(ExpeditionRegion) satisfies z.ZodType<ExpeditionRegion>,
}) satisfies z.ZodType<ExpeditionPassive>;
