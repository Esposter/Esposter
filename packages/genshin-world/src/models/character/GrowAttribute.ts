import { Attribute } from "#src/models/character/Attribute";
import { z } from "zod";

// An attribute that grows with level: its value at level 1, multiplied at each level by the curve it names
export interface GrowAttribute {
  attribute: Attribute;
  base: number;
  curve: string;
}

export const growAttributeSchema = z.object({
  attribute: z.enum(Attribute),
  base: z.number(),
  curve: z.string().min(1),
}) satisfies z.ZodType<GrowAttribute>;
