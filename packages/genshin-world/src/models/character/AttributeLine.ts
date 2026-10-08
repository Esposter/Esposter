import { Attribute } from "#src/models/character/Attribute";
import { z } from "zod";

// One attribute and how much of it something adds to a character: its own growth, an ascension, a weapon, an artifact's
// Affix or a set's bonus
export interface AttributeLine {
  attribute: Attribute;
  value: number;
}

export const attributeLineSchema = z.object({
  attribute: z.enum(Attribute),
  value: z.number(),
}) satisfies z.ZodType<AttributeLine>;
