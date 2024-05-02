import { z } from "zod";

const isPlainObject = (value: unknown): value is Record<string | number | symbol, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);

export const zodStrictRecord = <K extends z.ZodType<string | number | symbol>, V extends z.ZodTypeAny>(
  zKey: K,
  zValue: V,
) =>
  z.custom<Record<z.infer<K>, z.infer<V>>>(
    (input) =>
      isPlainObject(input) &&
      Object.entries(input).every(([key, value]) => zKey.safeParse(key).success && zValue.safeParse(value).success),
    "zodStrictRecord: error",
  );
