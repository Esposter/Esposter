import type { JSONSchema } from "zod/v4/core";

import { getReferencedJsonSchema } from "#server/services/mcp/getReferencedJsonSchema";

// The schemas a value `schema` describes may be described by: `schema` itself, every branch of a union or an
// Intersection, and the definition a `$ref` names in the root, each followed in turn. A `$ref` already followed on the
// Way is not followed again, so a recursive schema ends
export const getJsonSchemaBranches = (
  rootSchema: JSONSchema.BaseSchema,
  schema: JSONSchema._JSONSchema,
  followedRefs: ReadonlySet<string> = new Set(),
): JSONSchema.BaseSchema[] => {
  if (typeof schema === "boolean") return [];

  const { $ref, allOf = [], anyOf = [], oneOf = [] } = schema;
  const referencedSchema =
    $ref === undefined || followedRefs.has($ref) ? undefined : getReferencedJsonSchema(rootSchema, $ref);
  return [
    schema,
    ...(referencedSchema === undefined || $ref === undefined
      ? []
      : getJsonSchemaBranches(rootSchema, referencedSchema, new Set([...followedRefs, $ref]))),
    ...[...allOf, ...anyOf, ...oneOf].flatMap((branch) => getJsonSchemaBranches(rootSchema, branch, followedRefs)),
  ];
};
