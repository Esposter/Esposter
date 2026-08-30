import type { CreateUniqueArraySchema } from "#src/models/zod/CreateUniqueArraySchema";
import type { z } from "zod";

export const createUniqueArraySchema: CreateUniqueArraySchema = <TSchema extends z.ZodType>(
  schema: TSchema,
  key?: string,
): z.ZodArray<TSchema> =>
  schema
    .array()
    .refine(
      (array) =>
        new Set<unknown>(key === undefined ? array : array.map((item) => (item as Record<string, unknown>)[key]))
          .size === array.length,
      "Array items must be unique",
    );
