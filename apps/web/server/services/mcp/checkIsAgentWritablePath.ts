import type { JSONSchema } from "zod/v4/core";

import { checkIsUnwritableJsonSchema } from "#server/services/mcp/checkIsUnwritableJsonSchema";
import { getJsonSchemaBranches } from "#server/services/mcp/getJsonSchemaBranches";
import { getJsonSchemaChildren } from "#server/services/mcp/getJsonSchemaChildren";
import { parseJsonPointer } from "@esposter/shared";

// Whether an agent may write at a pointer into a document the agent JSON Schema describes: never at or under a node
// Unwritable on any branch on the way down. A write above one carries its own value for it, which the type's schema
// Parses at the save like any other
export const checkIsAgentWritablePath = (rootSchema: JSONSchema.BaseSchema, pointer: string): boolean => {
  let branches = getJsonSchemaBranches(rootSchema, rootSchema);
  for (const segment of parseJsonPointer(pointer)) {
    if (branches.some((branch) => checkIsUnwritableJsonSchema(branch))) return false;
    branches = branches
      .flatMap((branch) => getJsonSchemaChildren(branch, segment))
      .flatMap((childSchema) => getJsonSchemaBranches(rootSchema, childSchema));
  }
  return !branches.some((branch) => checkIsUnwritableJsonSchema(branch));
};
