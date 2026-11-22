import type { Primitive } from "type-fest";
import type { z } from "zod";

// A Set compares primitives by value, so an array of them is unique by its items alone. An array of objects is not:
// It takes a key (`createUniqueArraySchema`)
export const createUniquePrimitiveArraySchema = <TSchema extends z.ZodType<Primitive>>(
  schema: TSchema,
): z.ZodArray<TSchema> =>
  schema.array().refine((array) => new Set(array).size === array.length, { error: "Array items must be unique" });
