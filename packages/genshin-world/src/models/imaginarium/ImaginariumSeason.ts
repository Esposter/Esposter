import { Element } from "#src/models/Element";
import { z } from "zod";

// One season of the Imaginarium Theater: its id, the moments it begins and ends in the game's time zone, the difficulties it
// Runs by id, the reward group its Stellas draw from, its three elements, and the avatar ids of its opening characters and
// Special guests
export interface ImaginariumSeason {
  beginsAt: string;
  difficultyIds: number[];
  elements: Element[];
  endsAt: string;
  id: number;
  openingCharacterIds: number[];
  rewardGroup: number;
  specialGuestIds: number[];
}

export const imaginariumSeasonSchema = z.object({
  beginsAt: z.iso.datetime({ local: true }),
  difficultyIds: z.array(z.int().positive()).min(1),
  elements: z.array(z.enum(Element)).length(3),
  endsAt: z.iso.datetime({ local: true }),
  id: z.int().positive(),
  openingCharacterIds: z.array(z.int().positive()).min(1),
  rewardGroup: z.int().positive(),
  specialGuestIds: z.array(z.int().positive()).min(1),
}) satisfies z.ZodType<ImaginariumSeason>;
