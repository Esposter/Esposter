import { isPlainObject } from "@esposter/shared";
import { z } from "zod/v4";

export const zodStrictRecord = <K extends z.ZodType<PropertyKey>, V extends z.ZodType>(zKey: K, zValue: V) =>
  z.custom<Record<z.output<K>, z.output<V>>>(
    (input) =>
      isPlainObject(input) &&
      Object.entries(input).every(([key, value]) => zKey.safeParse(key).success && zValue.safeParse(value).success),
    `${zodStrictRecord.name}: error`,
  );
