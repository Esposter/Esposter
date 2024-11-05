import type { JSONSchema } from "@/models/jsonSchema/JSONSchema";
import type { JSONSchemaDefinition } from "@/models/jsonSchema/JSONSchemaDefinition";

import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";

export const recursiveAssignTitle = <T extends object>(properties: JSONSchema<T>["properties"] | undefined) => {
  if (!properties) return;
  for (const [key, prop] of Object.entries(properties) as [string, JSONSchemaDefinition][])
    if (prop.type === "object") recursiveAssignTitle(prop.properties as JSONSchema<T>["properties"]);
    else prop.title = toTitleCase(prettify(key));
};
