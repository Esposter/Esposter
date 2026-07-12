import { EN_US_DISJUNCTION_FORMATTER } from "#shared/services/intl/constants";
import { z } from "zod";

export const refineAtLeastOne = <T extends z.ZodObject>(schema: T, keys: (keyof z.infer<T>)[]) =>
  schema.refine((data) => keys.some((key) => data[key] !== undefined), {
    message: `At least one of ${EN_US_DISJUNCTION_FORMATTER.format(keys as string[])} must be provided`,
  });
