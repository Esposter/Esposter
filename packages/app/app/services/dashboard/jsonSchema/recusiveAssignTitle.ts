import type { JsonSchema } from "arktype";

import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";

export const recursiveAssignTitle = (properties: Record<string, JsonSchema> | undefined) => {
  if (!properties) return;
  for (const [key, prop] of Object.entries(properties) as [string, JsonSchema][])
    if ("type" in prop && prop.type === "object" && "properties" in prop) recursiveAssignTitle(prop.properties);
    else if ("title" in prop) prop.title = toTitleCase(prettify(key));
};
