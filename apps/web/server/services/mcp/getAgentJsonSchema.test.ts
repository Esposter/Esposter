import type { ResourceType } from "@esposter/db-schema";
import type { JSONSchema } from "zod/v4/core";

import { checkIsUnwritableJsonSchema } from "#server/services/mcp/checkIsUnwritableJsonSchema";
import { getAgentJsonSchema } from "#server/services/mcp/getAgentJsonSchema";
import { getReferencedJsonSchema } from "#server/services/mcp/getReferencedJsonSchema";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceTypes } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

// Every pointer the schema marks unwritable, "-" for an array's items and "*" for a record's values, each union's
// Branches read at the same pointer and each `$ref` followed once on the way down
const readUnwritablePaths = (
  rootSchema: JSONSchema.BaseSchema,
  schema: JSONSchema._JSONSchema,
  path = "",
  followedRefs: ReadonlySet<string> = new Set(),
): string[] => {
  if (typeof schema === "boolean") return [];
  else if (checkIsUnwritableJsonSchema(schema)) return [path];

  const {
    $ref,
    additionalProperties,
    allOf = [],
    anyOf = [],
    items,
    oneOf = [],
    prefixItems = [],
    properties = {},
  } = schema;
  const referencedSchema =
    $ref === undefined || followedRefs.has($ref) ? undefined : getReferencedJsonSchema(rootSchema, $ref);
  return [
    ...(referencedSchema === undefined || $ref === undefined
      ? []
      : readUnwritablePaths(rootSchema, referencedSchema, path, new Set([...followedRefs, $ref]))),
    ...[...allOf, ...anyOf, ...oneOf].flatMap((branch) => readUnwritablePaths(rootSchema, branch, path, followedRefs)),
    ...Object.entries(properties).flatMap(([key, propertySchema]) =>
      readUnwritablePaths(rootSchema, propertySchema, `${path}/${key}`, followedRefs),
    ),
    ...(additionalProperties === undefined
      ? []
      : readUnwritablePaths(rootSchema, additionalProperties, `${path}/*`, followedRefs)),
    ...prefixItems.flatMap((itemSchema, index) =>
      readUnwritablePaths(rootSchema, itemSchema, `${path}/${index}`, followedRefs),
    ),
    ...(items === undefined || Array.isArray(items)
      ? []
      : readUnwritablePaths(rootSchema, items, `${path}/-`, followedRefs)),
  ];
};

describe(getAgentJsonSchema, () => {
  // What each type's agent may not write: a new undescribed or read-only node fails here until it is described or
  // Recorded, so no type's reach widens or narrows unseen
  const ResourceTypeUnwritablePathsMap = {
    Blueprint: ["/entries/-/content"],
    Dashboard: [],
    Email: ["/html", "/*", "/pages/-"],
    Flowchart: [],
    Note: ["/doc/*", "/doc/attrs/*", "/doc/marks/-/*", "/doc/marks/-/attrs/*"],
    Program: [],
    Sheet: [
      "/data/columns/-/sourceName",
      "/data/columns/-/transformation/type",
      "/data/columns/-/type",
      "/settings/type",
    ],
    Survey: [],
    TodoList: [],
    Webpage: ["/css", "/html", "/*", "/pages/-"],
  } as const satisfies Record<ResourceType, string[]>;

  test.each(ResourceTypes)("describes the %s content as an object, its unwritable paths recorded", (type) => {
    expect.hasAssertions();

    const jsonSchema = getAgentJsonSchema(ResourceDefinitionMap[type].contentSchema);

    expect(jsonSchema.type).toBe("object");
    expect(new Set(readUnwritablePaths(jsonSchema, jsonSchema))).toStrictEqual(
      new Set(ResourceTypeUnwritablePathsMap[type]),
    );
  });

  test("describes a date as the string it is stored as", () => {
    expect.hasAssertions();

    expect(getAgentJsonSchema(z.date())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "date-time",
        "type": "string",
      }
    `);
  });

  test("throws on anything else JSON Schema cannot describe", () => {
    expect.hasAssertions();

    expect(() => getAgentJsonSchema(z.set(z.string()))).toThrowErrorMatchingInlineSnapshot(
      `[Error: Set cannot be represented in JSON Schema]`,
    );
  });
});
