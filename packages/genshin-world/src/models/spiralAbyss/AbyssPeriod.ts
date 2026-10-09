import { z } from "zod";

// One period of the Abyssal Moon Spire: its schedule id, the four floors it runs, the reward group its floors draw from,
// And the moment in the game's time zone it begins, as a wall-clock time the game's time zone reads
export interface AbyssPeriod {
  floorIds: number[];
  id: number;
  rewardGroup: number;
  startsAt: string;
}

export const abyssPeriodSchema = z.object({
  floorIds: z.array(z.int().positive()).length(4),
  id: z.int().positive(),
  rewardGroup: z.int().positive(),
  startsAt: z.iso.datetime({ local: true }),
}) satisfies z.ZodType<AbyssPeriod>;
