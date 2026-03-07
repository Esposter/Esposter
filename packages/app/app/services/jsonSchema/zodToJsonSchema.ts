import { recurseProperties } from "@/services/jsonSchema/recurseProperties";
import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";
import { z } from "zod";

export const zodToJsonSchema = (schema: z.ZodObject) => {
  // For integrating with vjsf, we only need the type and properties
  const { properties, type } = z.toJSONSchema(schema) as z.core.JSONSchema.ObjectSchema;
  recurseProperties(properties, {
    objectHooks: [
      (key, property) => {
        console.log(property);
        property.anyOf ??= toTitleCase(prettify(key));
      },
    ],
    otherHooks: [
      (key, property) => {
        property.title ??= toTitleCase(prettify(key));
      },
    ],
  });
  return { properties, type };
};
