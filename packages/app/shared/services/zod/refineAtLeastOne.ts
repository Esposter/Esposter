import { joinWithOxfordOr } from "#shared/util/text/joinWithOxfordOr";
import { z } from "zod";

export const refineAtLeastOne = <T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  keys: (keyof z.infer<T>)[],
): z.ZodEffects<T> =>
  schema.refine((data) => keys.some((key) => data[key] !== undefined), {
    message: `At least one of ${joinWithOxfordOr(keys as string[])} must be provided`,
  });
