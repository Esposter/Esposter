import { z } from "zod";

// A value of a kit's record read from a talent's table, by its proud skill group and its parameter's index, or a number
// Where no table holds it
export type KitParameter = number | { index: number; proudSkillGroupId: number };

export const kitParameterSchema = z.union([
  z.number(),
  z.object({ index: z.int().nonnegative(), proudSkillGroupId: z.int().positive() }),
]) satisfies z.ZodType<KitParameter>;
