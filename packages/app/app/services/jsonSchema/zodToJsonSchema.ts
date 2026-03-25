import { recurseProperties } from "@/services/jsonSchema/recurseProperties";
import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";
import { z } from "zod";

const applyPropertyHooks = (properties: z.core.JSONSchema.JSONSchema["properties"]) => {
  recurseProperties(properties, {
    otherHooks: [
      (key, property) => {
        // Apply prettify so enum values like "ConvertTo" become "Convert To"
        property.title = toTitleCase(prettify(property.title ?? key));
        // Support z.union => anyOf
        // Vjsf doesn't support anyOf since it can have different values
        // But we know it will always come from the same enum
        // We just need to use z.union to define metadata with z.literal so we migrate anyOf to oneOf
        if (property.anyOf) {
          property.oneOf = property.anyOf;
          delete property.anyOf;
        }
      },
    ],
  });
};

export const zodToJsonSchema = (schema: z.ZodType) => {
  // Only get the minimal information required to integrate with vjsf
  // $schema is stripped because vjsf's internal Ajv2019 instance does not have the draft 2020-12 meta-schema loaded
  const { $schema: _, ...result } = z.toJSONSchema(schema, {
    override: (ctx) => {
      const meta = (ctx.zodSchema as z.ZodObject).meta();
      if (!meta?.comp && !meta?.getProps && !meta?.getItems) return;
      const layout: Record<string, unknown> = {};
      if (meta.comp) layout.comp = meta.comp;
      if (meta.getProps) layout.getProps = meta.getProps;
      if (meta.getItems) layout.getItems = meta.getItems;
      (ctx.jsonSchema as Record<string, unknown>).layout = layout;
    },
  });
  if (result.properties) applyPropertyHooks(result.properties);
  if (result.oneOf)
    for (const variant of result.oneOf) {
      if (typeof variant === "boolean") continue;
      if (variant.title) variant.title = toTitleCase(prettify(variant.title));
      if (variant.properties) applyPropertyHooks(variant.properties);
    }
  return result;
};
