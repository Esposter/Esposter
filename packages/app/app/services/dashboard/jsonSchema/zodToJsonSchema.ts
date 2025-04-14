import type { core, ZodObject } from "zod";

import { recursiveAssignTitle } from "@/services/dashboard/jsonSchema/recusiveAssignTitle";
import { z } from "zod";

export const zodToJsonSchema = (schema: ZodObject) => {
  // For integrating with vjsf, we only need the type and properties
  const { properties, type } = z.toJSONSchema(schema) as core.JSONSchema.ObjectSchema;
  recursiveAssignTitle(properties);
  return { properties, type };
};
