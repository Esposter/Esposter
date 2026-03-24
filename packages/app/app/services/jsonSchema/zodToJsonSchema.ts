import { recurseProperties } from "@/services/jsonSchema/recurseProperties";
import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";
import { z } from "zod";

const convertAnyOfToOneOf = (jsonSchema: Record<string, unknown>): Record<string, unknown> => {
  if (!Array.isArray(jsonSchema.anyOf)) return jsonSchema;
  const { anyOf, ...rest } = jsonSchema;
  return { ...rest, oneOf: (anyOf as Record<string, unknown>[]).map((branch) => convertAnyOfToOneOf(branch)) };
};

export const zodToJsonSchema = (schema: z.ZodType) => {
  const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;
  // Support z.discriminatedUnion => anyOf at top level
  // Recursively convert anyOf → oneOf so Vjsf can use the discriminant const fields
  if (Array.isArray(jsonSchema.anyOf)) return convertAnyOfToOneOf(jsonSchema);
  const { properties, type } = jsonSchema as z.core.JSONSchema.ObjectSchema;
  recurseProperties(properties, {
    otherHooks: [
      (key, property) => {
        property.title ??= toTitleCase(prettify(key));
        // Support z.union => anyOf
        // Vjsf doesn't support anyOf since it can have different values
        // But we know it will always come from the same enum
        // We just need to use z.union to define metadata with z.literal so we migrate anyOf to oneOf
        if (property.anyOf) {
          property.oneOf = property.anyOf;
          delete property.anyOf;
        }
        // Support z.literal => const
        // Vjsf component doesn't show up with const
        if (property.const) delete property.const;
      },
    ],
  });
  return { properties, type };
};
