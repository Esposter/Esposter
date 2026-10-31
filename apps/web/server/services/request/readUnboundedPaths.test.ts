import type { JSONSchema } from "zod/v4/core";

import { OPAQUE_KEY } from "#server/services/mcp/constants";
import { describe } from "vitest";
import { z } from "zod";

describe.todo("readUnboundedPaths");

// A request schema as the JSON Schema its caller is held to, read as the output side, where the convention puts every
// Constraint. A `z.unknown()` or `z.any()` is stamped opaque, since its JSON Schema is otherwise `{}`
export const getRequestJsonSchema = (schema: z.ZodType): JSONSchema.BaseSchema =>
  z.toJSONSchema(schema, {
    io: "output",
    override: ({ jsonSchema, zodSchema }) => {
      if (zodSchema instanceof z.ZodAny || zodSchema instanceof z.ZodUnknown) jsonSchema[OPAQUE_KEY] = true;
    },
    unrepresentable: "any",
  });

// Every path under `schema` where a string or an array accepts input of any size. A string is bounded by a length,
// An enumeration, or a pattern that fixes its size — a format alone is not one, since a URL or an email has no ceiling
// Of its own. A pattern is open when it holds a `*`, a `+` or an `{n,}` repeat, and a class holding a `+` reads as one
// Too, which only asks for a length the schema could have carried anyway. An array is bounded by its item count. An
// Opaque subschema is skipped: it holds whatever strings and arrays it is sent, which its own schema parses once it
// Is applied
export const readUnboundedPaths = (schema: boolean | JSONSchema.JSONSchema, path: string): string[] => {
  if (typeof schema === "boolean" || schema[OPAQUE_KEY] === true) return [];

  const unboundedPaths: string[] = [];
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  const isEnumerated = schema.enum !== undefined || schema.const !== undefined;
  if (
    types.includes("string") &&
    !isEnumerated &&
    schema.maxLength === undefined &&
    (schema.pattern === undefined || /[*+]|\{\d+,\}/u.test(schema.pattern))
  )
    unboundedPaths.push(`${path} (string)`);
  if (types.includes("array") && schema.maxItems === undefined && schema.prefixItems === undefined)
    unboundedPaths.push(`${path} (array)`);

  for (const [key, propertySchema] of Object.entries(schema.properties ?? {}))
    unboundedPaths.push(...readUnboundedPaths(propertySchema, `${path}.${key}`));
  for (const [index, subschema] of [
    ...(schema.anyOf ?? []),
    ...(schema.oneOf ?? []),
    ...(schema.allOf ?? []),
  ].entries())
    unboundedPaths.push(...readUnboundedPaths(subschema, `${path}|${index}`));
  for (const [index, itemSchema] of (schema.prefixItems ?? []).entries())
    unboundedPaths.push(...readUnboundedPaths(itemSchema, `${path}[${index}]`));
  if (schema.items !== undefined && !Array.isArray(schema.items))
    unboundedPaths.push(...readUnboundedPaths(schema.items, `${path}[]`));
  if (schema.additionalProperties !== undefined)
    unboundedPaths.push(...readUnboundedPaths(schema.additionalProperties, `${path}{}`));
  if (schema.propertyNames !== undefined)
    unboundedPaths.push(...readUnboundedPaths(schema.propertyNames, `${path}{key}`));
  for (const [name, definition] of Object.entries(schema.$defs ?? {}))
    unboundedPaths.push(...readUnboundedPaths(definition, `${path}$${name}`));
  return unboundedPaths;
};
