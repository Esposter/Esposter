import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { z } from "zod";

// When one kind of a region's outcrop opens: at an Adventure Rank, and once each of the listed nations has an area
// Unlocked, which the game takes as its Statue of The Seven activated
export interface OutcropKindRule {
  kind: OutcropKind;
  playerLevel: number;
  unlockCityIds: number[];
}

export const outcropKindRuleSchema = z.object({
  kind: z.enum(OutcropKind),
  playerLevel: z.int().min(1),
  unlockCityIds: z.array(z.int().min(1)),
}) satisfies z.ZodType<OutcropKindRule>;
