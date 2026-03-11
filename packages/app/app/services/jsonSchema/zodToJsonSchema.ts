import { recurseProperties } from "@/services/jsonSchema/recurseProperties";
import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";
import { z } from "zod";

export const zodToJsonSchema = (schema: z.ZodObject) => {
  // For integrating with vjsf, we only need the type and properties
  const { properties, type } = z.toJSONSchema(schema, {
    override: (ctx) => {
      const meta = (ctx.zodSchema as z.ZodObject).meta();
      if (!meta?.rules?.length) return;
      (ctx.jsonSchema as Record<string, unknown>).layout = {
        props: { rules: meta.rules },
      };
    },
  }) as z.core.JSONSchema.ObjectSchema;
  recurseProperties(properties, {
    otherHooks: [
      (key, property) => {
        property.title ??= toTitleCase(prettify(key));
        // Migrate anyOf to oneOf since we just need to support enums properly for vjsf
        if (property.anyOf) {
          property.oneOf = property.anyOf;
          delete property.anyOf;
        }
      },
    ],
  });
  return { properties, type };
};
