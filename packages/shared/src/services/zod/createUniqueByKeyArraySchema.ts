import type { z } from "zod";

// The one uniqueness refine every unique array takes: its items are unique by the key each one is given
export const createUniqueByKeyArraySchema = <TSchema extends z.ZodType>(
  schema: TSchema,
  getKey: (item: z.output<TSchema>) => unknown,
): z.ZodArray<TSchema> =>
  schema
    .array()
    .refine((array) => new Set(array.map((item) => getKey(item))).size === array.length, {
      error: "Array items must be unique",
    });
