import type { z } from "zod";

import { processSchema } from "@/services/jsonSchema/processSchema";

export const processProperties = (properties: z.core.JSONSchema.JSONSchema["properties"]) => {
  if (!properties) return;

  for (const [key, property] of Object.entries(properties))
    if (typeof property !== "boolean") processSchema(property, key);
};
