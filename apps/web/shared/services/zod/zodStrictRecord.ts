import { checkIsPlainObject } from "@esposter/shared";
import { z } from "zod";

export const zodStrictRecord = <TKey extends z.ZodType<PropertyKey>, TValue extends z.ZodType>(
  keySchema: TKey,
  valueSchema: TValue,
) =>
  z.custom<Record<z.output<TKey>, z.output<TValue>>>(
    (input) =>
      checkIsPlainObject(input) &&
      Object.entries(input).every(
        ([key, value]) => keySchema.safeParse(key).success && valueSchema.safeParse(value).success,
      ),
    `${zodStrictRecord.name}: error`,
  );
