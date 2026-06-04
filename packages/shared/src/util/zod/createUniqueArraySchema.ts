import { z } from "zod";

interface CreateUniqueArraySchema {
  <T extends Record<string, unknown>>(schema: z.ZodType<T>, key: keyof T & string): z.ZodArray<z.ZodType<T>>;
  <T>(schema: z.ZodType<T>): z.ZodArray<z.ZodType<T>>;
}

export const createUniqueArraySchema: CreateUniqueArraySchema = <T>(
  schema: z.ZodType<T>,
  key?: keyof T & string,
): z.ZodArray<z.ZodType<T>> =>
  schema
    .array()
    .refine(
      (array: T[]) =>
        new Set<unknown>(key === undefined ? array : array.map((item) => item[key])).size === array.length,
      "Array items must be unique",
    );
