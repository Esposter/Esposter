import { z } from "zod";

interface CreateUniqueArraySchema {
  <TSchema extends z.ZodObject>(schema: TSchema, key: keyof TSchema["shape"] & string): z.ZodArray<TSchema>;
  <TOutput extends object, TInput>(
    schema: z.ZodType<TOutput, TInput>,
    key: keyof TOutput & string,
  ): z.ZodArray<z.ZodType<TOutput, TInput>>;
  <TSchema extends z.ZodType>(schema: TSchema): z.ZodArray<TSchema>;
}

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
