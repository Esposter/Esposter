import type { JSONSchema } from "zod/v4/core";

import { OPAQUE_KEY } from "#server/services/mcp/constants";
import { describe } from "vitest";
import { z } from "zod";

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

describe.todo("getRequestJsonSchema");
