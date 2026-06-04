import { z } from "zod";

interface CreateUniqueArraySchema {
  <T extends z.ZodType<Record<string, unknown>>>(schema: T, key: keyof z.output<T> & string): z.ZodArray<T>;
  <T extends z.ZodType>(schema: T): z.ZodArray<T>;
}

export const createUniqueArraySchema: CreateUniqueArraySchema = <T extends z.ZodType>(
  schema: T,
  key?: string,
): z.ZodArray<T> =>
  schema
    .array()
    .refine(
      (array: z.output<T>[]) =>
        new Set<unknown>(key === undefined ? array : array.map((item) => item[key])).size === array.length,
      "Array items must be unique",
    );
