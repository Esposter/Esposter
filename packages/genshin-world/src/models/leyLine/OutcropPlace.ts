import { z } from "zod";

// One place an outcrop can stand, in the game's blossom group table: the section it belongs to, and the places it moves
// To next, the first of which is the next place and the rest are read by no rule yet
export interface OutcropPlace {
  id: number;
  nextIds: number[];
  sectionId: number;
}

export const outcropPlaceSchema = z.object({
  id: z.int().min(1),
  nextIds: z.array(z.int().min(1)),
  sectionId: z.int().min(1),
}) satisfies z.ZodType<OutcropPlace>;
