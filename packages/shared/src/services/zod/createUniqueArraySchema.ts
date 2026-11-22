import type { UniqueArraySchemaKey } from "#src/models/zod/UniqueArraySchemaKey";
import type { z } from "zod";

import { ID_SEPARATOR } from "#src/util/id/constants";
import { checkIsRecord } from "#src/util/object/checkIsRecord";

// A composite key is its parts joined by the one separator, so items unique by the whole of it are told apart by it
const getItemKey = (item: unknown, key: readonly string[] | string): unknown => {
  if (!checkIsRecord(item)) return undefined;
  return typeof key === "string" ? item[key] : key.map((part) => item[part]).join(ID_SEPARATOR);
};

// Items are told apart by a key, because a Set compares an object by reference: a schema of objects with no key would
// Pass two equal objects as unique. An array of primitives takes `createUniquePrimitiveArraySchema` instead
export const createUniqueArraySchema = <TSchema extends z.ZodType<object>>(
  schema: TSchema,
  key: readonly UniqueArraySchemaKey<TSchema>[] | UniqueArraySchemaKey<TSchema>,
): z.ZodArray<TSchema> =>
  schema
    .array()
    .refine((array) => new Set<unknown>(array.map((item) => getItemKey(item, key))).size === array.length, {
      error: "Array items must be unique",
    });
