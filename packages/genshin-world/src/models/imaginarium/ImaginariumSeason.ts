import { z } from "zod";

// One season of the Imaginarium Theater: its id, the moments it begins and ends in the game's time zone, the difficulties it
// Runs by id, and the reward group its Stellas draw from
export interface ImaginariumSeason {
  beginsAt: string;
  difficultyIds: number[];
  endsAt: string;
  id: number;
  rewardGroup: number;
}

export const imaginariumSeasonSchema = z.object({
  beginsAt: z.iso.datetime({ local: true }),
  difficultyIds: z.array(z.int().positive()).min(1),
  endsAt: z.iso.datetime({ local: true }),
  id: z.int().positive(),
  rewardGroup: z.int().positive(),
}) satisfies z.ZodType<ImaginariumSeason>;
