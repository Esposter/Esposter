import type { CreateUniqueArraySchema } from "#src/models/zod/CreateUniqueArraySchema";
import type { z } from "zod";

import { ID_SEPARATOR } from "#src/util/id/constants";

const checkIsRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

// A composite key is its parts joined by the one separator, so items unique by the whole of it are told apart by it
const getItemKey = (item: unknown, key: readonly string[] | string): unknown => {
  if (!checkIsRecord(item)) return undefined;
  return typeof key === "string" ? item[key] : key.map((part) => item[part]).join(ID_SEPARATOR);
};

export const createUniqueArraySchema: CreateUniqueArraySchema = <TSchema extends z.ZodType>(
  schema: TSchema,
  key?: readonly string[] | string,
): z.ZodArray<TSchema> =>
  schema
    .array()
    .refine(
      (array) =>
        new Set<unknown>(key === undefined ? array : array.map((item) => getItemKey(item, key))).size === array.length,
      { error: "Array items must be unique" },
    );
