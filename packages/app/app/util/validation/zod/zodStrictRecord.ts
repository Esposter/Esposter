import { isPlainObject } from "@esposter/shared";
import { z } from "zod";

export const zodStrictRecord = <K extends PropertyKey, V>(zKey: z.ZodType<K>, zValue: z.ZodType<V>) =>
  z.custom<Record<K, V>>(
    (input) =>
      isPlainObject(input) &&
      Object.entries(input).every(([key, value]) => zKey.safeParse(key).success && zValue.safeParse(value).success),
    `${zodStrictRecord.name}: error`,
  );
