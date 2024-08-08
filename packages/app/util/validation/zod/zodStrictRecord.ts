import { isPlainObject } from "@/util/object/isPlainObject";
import { z } from "zod";

export const zodStrictRecord = <K extends z.ZodType<number | string | symbol>, V extends z.ZodSchema>(
  zKey: K,
  zValue: V,
) =>
  z.custom<Record<z.infer<K>, z.infer<V>>>(
    (input) =>
      isPlainObject(input) &&
      Object.entries(input).every(([key, value]) => zKey.safeParse(key).success && zValue.safeParse(value).success),
    "zodStrictRecord: error",
  );
