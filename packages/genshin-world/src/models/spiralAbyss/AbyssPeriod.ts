import type { AbyssPeriodBlessing } from "#src/models/spiralAbyss/AbyssPeriodBlessing";

import { abyssPeriodBlessingSchema } from "#src/models/spiralAbyss/AbyssPeriodBlessing";
import { z } from "zod";

// One period of the Abyssal Moon Spire: its schedule id, the four floors it runs, the reward group its floors draw from, the
// Blessing it gives, and the moments in the game's time zone it opens and closes, as wall-clock times the game's time zone
// Reads. The close is the last second the period runs
export interface AbyssPeriod {
  blessing: AbyssPeriodBlessing;
  closesAt: string;
  floorIds: number[];
  id: number;
  rewardGroup: number;
  startsAt: string;
}

export const abyssPeriodSchema = z.object({
  blessing: abyssPeriodBlessingSchema,
  closesAt: z.iso.datetime({ local: true }),
  floorIds: z.array(z.int().positive()).length(4),
  id: z.int().positive(),
  rewardGroup: z.int().positive(),
  startsAt: z.iso.datetime({ local: true }),
}) satisfies z.ZodType<AbyssPeriod>;
