import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";

import { abyssChamberSchema } from "#src/models/spiralAbyss/AbyssChamber";
import { z } from "zod";

// A floor of the Spiral Abyss: its place in the twelve, its three chambers, the teams each chamber takes (one, or two for
// The two halves of a chamber, which share one clock), and the stars its three chambers must hold for the floor above
export interface AbyssFloor {
  chambers: AbyssChamber[];
  id: number;
  index: number;
  teamCount: number;
  unlockStarCount: number;
}

export const abyssFloorSchema = z.object({
  chambers: z.array(abyssChamberSchema).length(3),
  id: z.int().positive(),
  index: z.int().positive(),
  teamCount: z.int().positive(),
  unlockStarCount: z.int().positive(),
}) satisfies z.ZodType<AbyssFloor>;
