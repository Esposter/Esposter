import type { NullToUndefined } from "@/util/types/NullToUndefined";

import { checkIsPlainObject } from "@/util/object/checkIsPlainObject";

// Converts the Drizzle/Azure boundary shape (`null`) into the app-owned absent-value sentinel (`undefined`),
// Recursing through plain objects and arrays so a whole select row can be converted at the query layer rather
// Than field-by-field. Dates and class instances are preserved as-is. The casts restate the runtime key
// Mapping, which TypeScript cannot correlate back to NullToUndefined<T>.
export const nullToUndefined = <T>(value: T): NullToUndefined<T> => {
  if (value === null) return undefined as NullToUndefined<T>;
  else if (Array.isArray(value)) return value.map((item) => nullToUndefined(item)) as NullToUndefined<T>;
  else if (checkIsPlainObject(value))
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, nullToUndefined(item)]),
    ) as NullToUndefined<T>;
  return value as NullToUndefined<T>;
};
