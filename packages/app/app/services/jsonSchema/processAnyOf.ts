import type { z } from "zod";

export const processAnyOf = (schema: z.core.JSONSchema.JSONSchema) => {
  if (!schema.anyOf) return;
  // Z.union (used to define z.literal metadata) emits anyOf, which vjsf doesn't support.
  // Our values always come from the same enum, so migrate anyOf to oneOf as a workaround.
  schema.oneOf = schema.anyOf;
  delete schema.anyOf;
};
