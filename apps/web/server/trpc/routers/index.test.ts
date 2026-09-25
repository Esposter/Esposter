import type { AnyProcedure } from "@trpc/server";
import type { JSONSchema } from "zod/v4/core";

import { trpcRouter } from "@@/server/trpc/routers";
import { describe, expect, test } from "vitest";
import { z } from "zod";

// Every path under `schema` where a string or an array accepts input of any size. A string is bounded by a
// Length, a format or a pattern (each of which a request cannot stretch past what the format allows, since an
// Anchored format rejects the excess), and an array by its item count
const readUnboundedPaths = (schema: boolean | JSONSchema.JSONSchema, path: string): string[] => {
  if (typeof schema === "boolean") return [];

  const unboundedPaths: string[] = [];
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  const isEnumerated = schema.enum !== undefined || schema.const !== undefined;
  if (
    types.includes("string") &&
    !isEnumerated &&
    schema.maxLength === undefined &&
    schema.format === undefined &&
    schema.pattern === undefined
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

describe("trpcRouter", () => {
  // The key the conversion stamps on a `z.unknown()` or `z.any()`, whose `{}` the walk would otherwise read as bounded
  const OPAQUE_KEY = "x-opaque";
  // A request body is parsed whole before a procedure runs, so an input with no ceiling lets any caller hand the
  // Server a string or an array as large as the body limit, and have it validated, stored or queried with
  test("bounds every string and array in every procedure's input", () => {
    expect.hasAssertions();

    const unboundedProcedurePaths = new Set<string>();
    const opaqueProcedurePaths = new Set<string>();
    // The record is flat at runtime, one procedure per dotted path, where its type nests the sub-routers
    const procedures = trpcRouter._def.procedures as unknown as Record<string, AnyProcedure>;

    for (const [procedurePath, procedure] of Object.entries(procedures))
      for (const input of procedure._def.inputs) {
        // The output side is where the convention puts every constraint: a normalised string trims before its
        // Final pipe checks the length, so its input side is a bare string by construction
        const jsonSchema = z.toJSONSchema(input as z.ZodType, {
          io: "output",
          override: ({ jsonSchema: overriddenJsonSchema, zodSchema }) => {
            if (zodSchema instanceof z.ZodAny || zodSchema instanceof z.ZodUnknown)
              overriddenJsonSchema[OPAQUE_KEY] = true;
          },
          unrepresentable: "any",
        });
        if (readUnboundedPaths(jsonSchema, procedurePath).length > 0) unboundedProcedurePaths.add(procedurePath);
        if (JSON.stringify(jsonSchema).includes(`"${OPAQUE_KEY}":true`)) opaqueProcedurePaths.add(procedurePath);
      }

    expect([...unboundedProcedurePaths]).toStrictEqual([]);
    // An opaque value holds whatever strings and arrays it is sent, so these are the procedures where only the body
    // Limit bounds them: each carries a document whose shape another library or resource owns (GrapesJS, Vue Flow,
    // TipTap, SurveyJS answers, a blueprint's entries). A new one fails here until it is bounded or named
    expect([...opaqueProcedurePaths]).toStrictEqual([
      "blueprint.saveResourceContent",
      "email.saveResourceContent",
      "flowchart.saveResourceContent",
      "note.saveResourceContent",
      "survey.createSurveyResponse",
      "survey.updateSurveyResponse",
      "webpage.saveResourceContent",
    ]);
  });
});
