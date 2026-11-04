import type { JSONSchema } from "zod/v4/core";

import { checkIsUnwritableJsonSchema } from "#server/services/mcp/checkIsUnwritableJsonSchema";
import { getAgentJsonSchema } from "#server/services/mcp/getAgentJsonSchema";
import { getReferencedJsonSchema } from "#server/services/mcp/getReferencedJsonSchema";
import { WEBPAGE_PLACEABLE_NODE_TYPES } from "#shared/services/pageBuilder/constants";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceType, ResourceTypes } from "@esposter/db-schema";
import { assert, describe, expect, test } from "vitest";
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

const readOneOf = (schema: JSONSchema._JSONSchema | undefined): JSONSchema._JSONSchema[] =>
  schema === undefined || typeof schema === "boolean" ? [] : (schema.oneOf ?? []);

// The paths a page builder rich text node leaves undescribed, under the pointer of the node holding it
const richTextPaths = (pointer: string) => [
  `${pointer}/props/content/*`,
  `${pointer}/props/content/attrs/*`,
  `${pointer}/props/content/marks/-/*`,
  `${pointer}/props/content/marks/-/attrs/*`,
];

// The one `$ref` an array's items point at, or none when the items are not a single schema
const readItemsRef = (schema: JSONSchema._JSONSchema | undefined) => {
  if (typeof schema !== "object" || Array.isArray(schema.items) || typeof schema.items !== "object") return undefined;
  return schema.items.$ref;
};

describe(getAgentJsonSchema, () => {
  // An email nests its body one more child deep each level, and each level holds rich text
  const childRichTextPaths = Array.from(
    { length: 6 },
    (_value, index) => `/content/-${"/props/children/-".repeat(index + 1)}`,
  ).flatMap((pointer) => richTextPaths(pointer));
  // What each type's agent may not write: a new undescribed or read-only node fails here until it is described or
  // Recorded, so no type's reach widens or narrows unseen
  const ResourceTypeUnwritablePathsMap = {
    [ResourceType.Blueprint]: ["/entries/-/content"],
    [ResourceType.Dashboard]: [],
    [ResourceType.Email]: [...childRichTextPaths, "/html"],
    [ResourceType.Note]: ["/doc/*", "/doc/attrs/*", "/doc/marks/-/*", "/doc/marks/-/attrs/*"],
    [ResourceType.Program]: [],
    [ResourceType.Sheet]: [
      "/data/columns/-/sourceName",
      "/data/columns/-/transformation/type",
      "/data/columns/-/type",
      "/settings/type",
    ],
    [ResourceType.Survey]: [],
    [ResourceType.TodoList]: [],
    [ResourceType.Webpage]: [...richTextPaths("/content/-"), "/html"],
    // An arrow end's connection point is the one the core derives from its binding
    [ResourceType.Whiteboard]: ["/elements/-/end/point", "/elements/-/start/point"],
  } as const satisfies Record<ResourceType, string[]>;

  test.each(ResourceTypes)("a type whose content schema is not an object fails CI: %s", (type) => {
    expect.hasAssertions();

    expect(getAgentJsonSchema(ResourceDefinitionMap[type].contentSchema).type).toBe("object");
  });

  test.each(ResourceTypes)("a change to a type's described surface fails CI until it is recorded: %s", (type) => {
    expect.hasAssertions();

    const jsonSchema = getAgentJsonSchema(ResourceDefinitionMap[type].contentSchema);

    expect(new Set(readUnwritablePaths(jsonSchema, jsonSchema))).toStrictEqual(
      new Set(ResourceTypeUnwritablePathsMap[type]),
    );
  });

  // A group's visuals are the visual schema again, so the tree is described once and nested by reference
  test("describes a group's visuals as the visual schema again, by reference", () => {
    expect.hasAssertions();

    const { $defs = {}, properties = {} } = getAgentJsonSchema(
      ResourceDefinitionMap[ResourceType.Dashboard].contentSchema,
    );
    const visualRef = readItemsRef(properties.visuals);
    assert.exists(visualRef);
    const visualSchema = $defs[visualRef.replace("#/$defs/", "")];

    expect(readItemsRef(typeof visualSchema === "object" ? visualSchema.properties?.visuals : undefined)).toBe(
      visualRef,
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

  // A slot's content is a union with one branch per type it takes, and a slot that recurses reads its branch by reference
  test("lists the types a webpage root's content takes, a branch by reference where a slot recurses", () => {
    expect.hasAssertions();

    const { $defs = {}, properties = {} } = getAgentJsonSchema(webpageDocumentSchema);
    const resolveSchema = (schema: JSONSchema._JSONSchema | undefined): JSONSchema._JSONSchema | undefined =>
      typeof schema === "object" && schema.$ref !== undefined ? $defs[schema.$ref.replace("#/$defs/", "")] : schema;
    const readBranchType = (branch: JSONSchema._JSONSchema | undefined): string | undefined => {
      const resolved = resolveSchema(branch);
      if (resolved === undefined || typeof resolved === "boolean") return undefined;
      const { type } = resolved.properties ?? {};
      return type === undefined || typeof type === "boolean" || typeof type.const !== "string" ? undefined : type.const;
    };
    const { content } = properties;
    const items = typeof content === "object" && !Array.isArray(content.items) ? content.items : undefined;

    expect(readOneOf(resolveSchema(items)).map((branch) => readBranchType(branch))).toStrictEqual(
      WEBPAGE_PLACEABLE_NODE_TYPES,
    );
  });
});
