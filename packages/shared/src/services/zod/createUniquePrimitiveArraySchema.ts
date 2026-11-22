import type { Primitive } from "type-fest";
import type { z } from "zod";

import { createUniqueByKeyArraySchema } from "#src/services/zod/createUniqueByKeyArraySchema";

// A Set compares primitives by value, so an array of them is unique by its items alone. An array of objects is not:
// It takes a key (`createUniqueArraySchema`)
export const createUniquePrimitiveArraySchema = <TSchema extends z.ZodType<Primitive>>(
  schema: TSchema,
): z.ZodArray<TSchema> => createUniqueByKeyArraySchema(schema, (item) => item);
