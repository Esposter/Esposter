import type { z } from "zod";

import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";

export const recursiveAssignTitle = (properties: z.core.JSONSchema.JSONSchema["properties"]) => {
  if (!properties) return;
  for (const [key, prop] of Object.entries(properties))
    if (typeof prop === "boolean") continue;
    else if (prop.type === "object") recursiveAssignTitle(prop.properties);
    else prop.title = toTitleCase(prettify(key));
};
