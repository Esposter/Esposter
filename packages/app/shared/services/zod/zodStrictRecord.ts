import { checkIsPlainObject } from "@esposter/shared";
import { z } from "zod";

export const zodStrictRecord = <K extends z.ZodType<PropertyKey>, V extends z.ZodType>(zKey: K, zValue: V) =>
  z.custom<Record<z.output<K>, z.output<V>>>(
    (input) =>
      checkIsPlainObject(input) &&
      Object.entries(input).every(([key, value]) => zKey.safeParse(key).success && zValue.safeParse(value).success),
    `${zodStrictRecord.name}: error`,
  );
