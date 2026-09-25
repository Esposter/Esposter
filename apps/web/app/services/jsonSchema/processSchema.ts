import type { z } from "zod";

import { processAnyOf } from "@/services/jsonSchema/processAnyOf";
import { processTitle } from "@/services/jsonSchema/processTitle";

const processedSchemas = new WeakSet<object>();

export const processSchema = (schema: z.core.JSONSchema.JSONSchema, key?: string) => {
  if (typeof schema !== "object" || schema === null || processedSchemas.has(schema)) return;
  processedSchemas.add(schema);
  processTitle(schema, key);
  // Ahead of the walk, since it turns an anyOf into the oneOf the walk descends into
  processAnyOf(schema);
  const { items, oneOf, properties } = schema;
  for (const variant of oneOf ?? []) if (typeof variant !== "boolean") processSchema(variant);
  for (const item of [items ?? []].flat()) if (typeof item !== "boolean") processSchema(item);
  for (const [propertyKey, property] of Object.entries(properties ?? {}))
    if (typeof property !== "boolean") processSchema(property, propertyKey);
};
