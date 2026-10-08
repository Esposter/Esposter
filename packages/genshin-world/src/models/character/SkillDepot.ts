import { Element } from "#src/models/Element";
import { z } from "zod";

// One of a character's skill sets by the game's own id: its skill's cooldown and charges, and its burst's cooldown, energy
// Cost and the element it deals, each left out where the set has no such skill or burst. A burst that costs no element
// Has no element
export interface SkillDepot {
  burst?: { cooldownSeconds: number; element?: Element; energyCost: number };
  depotId: number;
  skill?: { charges: number; cooldownSeconds: number };
}

export const skillDepotSchema = z.object({
  burst: z
    .object({
      cooldownSeconds: z.number().nonnegative(),
      element: z.enum(Element).optional(),
      energyCost: z.number().nonnegative(),
    })
    .optional(),
  depotId: z.int().positive(),
  skill: z.object({ charges: z.int().positive(), cooldownSeconds: z.number().nonnegative() }).optional(),
}) satisfies z.ZodType<SkillDepot>;
