import type { JSONSchema } from "zod/v4/core";
import { APPEND_SEGMENT, parseArrayIndex } from "@esposter/shared";

// The schemas the member a pointer's segment names may be described by, inside a value `schema` describes: an object's
// Property or else its record's values, and an array's item at that index or else any of its items
export const getJsonSchemaChildren = (schema: JSONSchema.BaseSchema, segment: string): JSONSchema._JSONSchema[] => {
  const { additionalProperties, items, prefixItems, properties } = schema;
  const childSchemas: JSONSchema._JSONSchema[] = [];
  const propertySchema = properties && Object.hasOwn(properties, segment) ? properties[segment] : additionalProperties;
  if (propertySchema !== undefined) childSchemas.push(propertySchema);

  const index = parseArrayIndex(segment, Number.POSITIVE_INFINITY);
  if (index === undefined && segment !== APPEND_SEGMENT) return childSchemas;

  // Zod writes a tuple's items as prefixItems, so an array of item schemas is never one it wrote
  const itemSchema = (index === undefined ? undefined : prefixItems?.[index]) ?? items;
  if (itemSchema !== undefined && !Array.isArray(itemSchema)) childSchemas.push(itemSchema);
  return childSchemas;
};
