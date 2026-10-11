import type { JSONSchema } from "zod/v4/core";

import { OPAQUE_KEY } from "#server/services/mcp/constants";

// A node of the agent JSON Schema an agent may not write at or under: one marked read-only, which the agent may not
// Change, or opaque, whose content the agent was never told
export const checkIsUnwritableJsonSchema = (schema: JSONSchema.BaseSchema): boolean =>
  schema.readOnly === true || schema[OPAQUE_KEY] === true;
