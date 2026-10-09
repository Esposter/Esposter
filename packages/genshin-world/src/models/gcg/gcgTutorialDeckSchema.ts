import { Element } from "#src/models/Element";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { z } from "zod";

// One line of a cost as the slice writes it: dice of an element, or a Matching, Unaligned or energy cost with no element
const gcgTutorialCostSchema = z.union([
  z.object({ count: z.int().positive(), element: z.enum(Element), kind: z.literal(GcgCostKind.Dice) }),
  z.object({
    count: z.int().positive(),
    kind: z.enum([GcgCostKind.Energy, GcgCostKind.Matching, GcgCostKind.Unaligned]),
  }),
]);

// The tutorial deck's slice, written from the game's tables and checked against its shapes before a duel reads it
export const gcgTutorialDeckSchema = z.object({
  cardIds: z.array(z.int().positive()),
  cards: z.array(
    z.object({
      costs: z.array(gcgTutorialCostSchema),
      effects: z.array(z.string()),
      id: z.int().positive(),
      kind: z.enum(GcgCardKind),
    }),
  ),
  characterIds: z.array(z.int().positive()),
  characters: z.array(
    z.object({
      element: z.enum(Element),
      hp: z.int().positive(),
      id: z.int().positive(),
      maxEnergy: z.int().nonnegative(),
      skills: z.array(
        z.object({
          costs: z.array(gcgTutorialCostSchema),
          effect: z.string(),
          energyGain: z.int().nonnegative(),
          id: z.int().positive(),
          kind: z.enum(GcgSkillKind),
        }),
      ),
      weapon: z.string(),
    }),
  ),
});
