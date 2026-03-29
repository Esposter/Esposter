import { processSchema } from "@/services/jsonSchema/processSchema";
import { z } from "zod";

export const processOneOf = (oneOf: z.core.JSONSchema.JSONSchema["oneOf"]) => {
  if (!oneOf) return;

  for (const variant of oneOf) {
    if (typeof variant === "boolean") continue;
    processSchema(variant);
  }
};
