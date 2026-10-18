import { z } from "zod";

// The place a bounty's target spawns at: the centre of the hunting region the dump places, with the radius it spans
export interface ReputationHuntingRegion {
  center: [number, number, number];
  id: number;
  radius: number;
}

export const reputationHuntingRegionSchema = z.object({
  center: z.tuple([z.number(), z.number(), z.number()]),
  id: z.int().positive(),
  radius: z.number().positive(),
}) satisfies z.ZodType<ReputationHuntingRegion>;
