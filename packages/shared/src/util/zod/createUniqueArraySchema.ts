import { z } from "zod";

export const createUniqueArraySchema = <T>(schema: z.ZodType<T>, key?: keyof T & string): z.ZodArray<z.ZodType<T>> =>
  schema
    .array()
    .refine(
      (array: T[]) =>
        new Set<unknown>(key !== undefined ? array.map((item) => item[key]) : array).size === array.length,
      "Array items must be unique",
    );
