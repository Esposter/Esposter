import type { JSONSchema } from "zod/v4/core";

import { OPAQUE_KEY } from "#server/services/mcp/constants";
import { z } from "zod";

// A schema as the JSON Schema an agent writes against: the input side, since an agent is a writer, so a normalised
// String is a string and a default optional. A Date has no JSON Schema of its own, so it is the date-time string
// `JSON.stringify` stores and a coerced or content schema reads back; any other type JSON cannot carry throws, so a
// Map, a Set or a BigInt never reaches an agent as `{}`. A `z.unknown()` or `z.any()` is stamped opaque, and a
// `readOnly` set through `.meta` or `.readonly()` comes through as it is
export const getAgentJsonSchema = (schema: z.ZodType): JSONSchema.BaseSchema =>
  z.toJSONSchema(schema, {
    io: "input",
    override: ({ jsonSchema, zodSchema }) => {
      if (zodSchema instanceof z.ZodAny || zodSchema instanceof z.ZodUnknown) jsonSchema[OPAQUE_KEY] = true;
    },
    unrepresentable: ({ zodSchema }) =>
      zodSchema instanceof z.ZodDate ? { format: "date-time", type: "string" } : "throw",
  });
