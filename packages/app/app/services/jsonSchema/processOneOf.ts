import { processProperties } from "@/services/jsonSchema/processProperties";
import { processTitle } from "@/services/jsonSchema/processTitle";
import { z } from "zod";

export const processOneOf = (oneOf: z.core.JSONSchema.JSONSchema["oneOf"]) => {
  if (!oneOf) return;

  for (const variant of oneOf) {
    if (typeof variant === "boolean") continue;
    processTitle(variant);
    processProperties(variant.properties);
  }
};
