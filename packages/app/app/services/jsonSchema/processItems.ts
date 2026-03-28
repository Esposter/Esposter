import { processSchema } from "@/services/jsonSchema/processSchema";
import { z } from "zod";

export const processItems = (schema: z.core.JSONSchema.JSONSchema) => {
  if (!schema.items) return;

  if (Array.isArray(schema.items)) {
    for (const item of schema.items) {
      if (typeof item !== "boolean") processSchema(item);
    }
  } else if (typeof schema.items !== "boolean") {
    processSchema(schema.items);
  }
};
