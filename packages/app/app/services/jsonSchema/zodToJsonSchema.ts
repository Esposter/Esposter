import { recurseProperties } from "@/services/jsonSchema/recurseProperties";
import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";
import { z } from "zod";

const applyOneOfVariantTitles = (oneOf: z.core.JSONSchema.JSONSchema["oneOf"]) => {
  if (!oneOf) return;
  for (const variant of oneOf) {
    if (typeof variant === "boolean") continue;
    if (variant.title) variant.title = toTitleCase(prettify(variant.title));
    if (variant.properties) applyPropertyHooks(variant.properties);
  }
};

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
        // Handle nested discriminated unions (properties that are oneOf rather than type: "object")
        if (property.oneOf) applyOneOfVariantTitles(property.oneOf);
      },
    ],
  });
};

const layoutProperties = ["comp", "getProps", "getItems"] as const;

export const zodToJsonSchema = (schema: z.ZodType) => {
  // Only get the minimal information required to integrate with vjsf
  // $schema is stripped because vjsf's internal Ajv2019 instance does not have the draft 2020-12 meta-schema loaded
  const { $schema: _, ...result } = z.toJSONSchema(schema, {
    override: (ctx) => {
      const zodSchema = ctx.zodSchema as z.ZodObject;
      const jsonSchema = ctx.jsonSchema as Record<string, unknown>;
      // Add discriminator for discriminated unions so vjsf auto-selects the active variant
      const def = zodSchema.def;
      if ("discriminator" in def && def.discriminator) jsonSchema.discriminator = { propertyName: def.discriminator };

      const meta = zodSchema.meta();
      if (!meta) return;
      const layout = Object.fromEntries(
        layoutProperties.filter((key) => meta[key] !== undefined).map((key) => [key, meta[key]]),
      );
      if (Object.keys(layout).length === 0) return;
      jsonSchema.layout = layout;
    },
  });
  if (result.properties) applyPropertyHooks(result.properties);
  if (result.oneOf) applyOneOfVariantTitles(result.oneOf);
  return result;
};
