import { z } from "zod";

// A proficiency as the generated proficiency slice holds it, by its id, which each fish names, with its reel gears in the
// Table's order
export interface FishProficient {
  gear: FishProficientGear[];
  id: number;
}

// One reel gear of a proficiency: the number it is reached at, and how fast the tension rises and falls while the reel is
// Held and released inside the zone (`inSpeed`) and outside it (`outSpeed`)
export interface FishProficientGear {
  inSpeed: number;
  num: number;
  outSpeed: number;
}

export const fishProficientSchema = z.object({
  gear: z.array(z.object({ inSpeed: z.number(), num: z.int().nonnegative(), outSpeed: z.number() })),
  id: z.int().positive(),
}) satisfies z.ZodType<FishProficient>;
