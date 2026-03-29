import { processSchema } from "@/services/jsonSchema/processSchema";
import { z } from "zod";

export const processItems = (items: z.core.JSONSchema.JSONSchema["items"]) => {
  if (!items) return;

  if (Array.isArray(items)) {
    for (const item of items) {
      if (typeof item !== "boolean") processSchema(item);
    }
  } else if (typeof items !== "boolean") {
    processSchema(items);
  }
};
