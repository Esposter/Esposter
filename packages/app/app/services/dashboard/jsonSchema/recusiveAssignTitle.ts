import type { z } from "zod";

import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";

export const recursiveAssignTitle = (properties: z.core.JSONSchema.ObjectSchema["properties"]) => {
  if (!properties) return;
  for (const [key, prop] of Object.entries(properties))
    if (prop.type === "object") recursiveAssignTitle(prop.properties as z.core.JSONSchema.ObjectSchema["properties"]);
    else prop.title = toTitleCase(prettify(key.toString()));
};
