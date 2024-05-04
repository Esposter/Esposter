import { Utils } from "phaser";
import { z } from "zod";

export const zodStrictRecord = <K extends z.ZodType<string | number | symbol>, V extends z.ZodTypeAny>(
  zKey: K,
  zValue: V,
) =>
  z.custom<Record<z.infer<K>, z.infer<V>>>(
    (input) =>
      Utils.Objects.IsPlainObject(input) &&
      Object.entries(input).every(([key, value]) => zKey.safeParse(key).success && zValue.safeParse(value).success),
    "zodStrictRecord: error",
  );
