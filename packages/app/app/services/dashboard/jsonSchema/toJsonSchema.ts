import type { JsonSchema, Type } from "arktype";

import { recursiveAssignTitle } from "@/services/dashboard/jsonSchema/recusiveAssignTitle";

export const toJsonSchema = <T extends object>(schema: Type<T>) => {
  // For integrating with vjsf, we only need the type and properties
  const { properties, type } = schema.toJsonSchema() as JsonSchema.Object;
  recursiveAssignTitle(properties);
  return { properties, type };
};
