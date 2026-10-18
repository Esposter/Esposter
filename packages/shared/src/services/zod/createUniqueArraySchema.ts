import type { CreateUniqueArraySchema } from "#src/models/zod/CreateUniqueArraySchema";
import type { z } from "zod";

import { ID_SEPARATOR } from "#src/util/id/constants";

// A composite key is its parts joined by the one separator, so items unique by the whole of it are told apart by it
const getItemKey = (item: unknown, key: string | readonly string[]): unknown => {
  const record = item as Record<string, unknown>;
  return typeof key === "string" ? record[key] : key.map((part) => record[part]).join(ID_SEPARATOR);
};

export const createUniqueArraySchema: CreateUniqueArraySchema = <TSchema extends z.ZodType>(
  schema: TSchema,
  key?: string | readonly string[],
): z.ZodArray<TSchema> =>
  schema
    .array()
    .refine(
      (array) =>
        new Set<unknown>(key === undefined ? array : array.map((item) => getItemKey(item, key))).size === array.length,
      "Array items must be unique",
    );
