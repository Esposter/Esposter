import type { z } from "zod";

export const processAnyOf = (schema: z.core.JSONSchema.JSONSchema) => {
  if (!schema.anyOf) return;
  // `z.union` of titled literals — an enum whose options each carry a title — emits anyOf. Its options always come from
  // One enum, so they are exclusive, and as oneOf they are the titled choice the schema form draws as one select
  schema.oneOf = schema.anyOf;
  delete schema.anyOf;
};
