import { ExpeditionPassiveKind } from "#src/models/expedition/ExpeditionPassiveKind";
import { ExpeditionRegion } from "#src/models/expedition/ExpeditionRegion";
import { z } from "zod";

// A utility passive whose description names an expedition, by the proud skill group it belongs to: a time talent shortens
// The expedition sent to its region by its percent, and a reward talent adds that percent to the rewards of the one sent to
// Its region for its hours. A time talent names no hours, so only a reward talent has them
export type ExpeditionPassive = ExpeditionRewardPassive | ExpeditionTimePassive;

interface ExpeditionRewardPassive {
  hours: number;
  kind: ExpeditionPassiveKind.Reward;
  percent: number;
  proudSkillGroupId: number;
  region: ExpeditionRegion;
}
interface ExpeditionTimePassive {
  kind: ExpeditionPassiveKind.Time;
  percent: number;
  proudSkillGroupId: number;
  region: ExpeditionRegion;
}

const expeditionPassiveBaseSchema = z.object({
  percent: z.int().positive(),
  proudSkillGroupId: z.int().positive(),
  region: z.enum(ExpeditionRegion) satisfies z.ZodType<ExpeditionRegion>,
});
export const expeditionPassiveSchema = z.discriminatedUnion("kind", [
  expeditionPassiveBaseSchema.extend({ hours: z.int().positive(), kind: z.literal(ExpeditionPassiveKind.Reward) }),
  expeditionPassiveBaseSchema.extend({ kind: z.literal(ExpeditionPassiveKind.Time) }),
]) satisfies z.ZodType<ExpeditionPassive>;
