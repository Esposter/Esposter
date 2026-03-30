import type { z } from "zod";

export const processAnyOf = (schema: z.core.JSONSchema.JSONSchema) => {
  if (!schema.anyOf) return;
  // Support z.union => anyOf
  // We use z.union to define metadata with z.literal
  // But vjsf doesn't support anyOf since it can have different values
  // We know it will always come from the same enum though
  // So we can workaround this by migrating anyOf to oneOf
  schema.oneOf = schema.anyOf;
  delete schema.anyOf;
};
