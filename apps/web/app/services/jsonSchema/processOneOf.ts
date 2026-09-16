import type { z } from "zod";

import { processSchema } from "@/services/jsonSchema/processSchema";

export const processOneOf = (oneOf: z.core.JSONSchema.JSONSchema["oneOf"]) => {
  if (!oneOf) return;

  for (const variant of oneOf) {
    if (typeof variant === "boolean") continue;
    processSchema(variant);
  }
};
