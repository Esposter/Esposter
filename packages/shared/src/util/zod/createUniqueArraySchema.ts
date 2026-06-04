/* eslint-disable @typescript-eslint/no-duplicate-type-constituents */
// oxlint-disable @typescript-eslint/no-unnecessary-type-arguments
import { z } from "zod";

export const createUniqueArraySchema = <TSchema extends z.ZodType>(
  schema: TSchema,
  key?:
    | (TSchema extends z.ZodType<infer TOutput, unknown, z.core.$ZodTypeInternals<infer TOutput, unknown>>
        ? TOutput extends object
          ? keyof TOutput & string
          : never
        : never)
    | undefined,
): z.ZodArray<TSchema> =>
  schema
    .array()
    .refine(
      (array) =>
        new Set<unknown>(key === undefined ? array : array.map((item) => (item as Record<string, unknown>)[key]))
          .size === array.length,
      "Array items must be unique",
    );
