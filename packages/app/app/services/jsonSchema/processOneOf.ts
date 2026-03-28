import { processSchema } from "@/services/jsonSchema/processSchema";
import { z } from "zod";

export const processOneOf = (schema: z.core.JSONSchema.JSONSchema) => {
  const { discriminator, oneOf } = schema;
  if (!oneOf) return;

  const propertyName = (discriminator as { propertyName?: string })?.propertyName;
  if (propertyName) {
    const expandedOneOf: Exclude<z.core.JSONSchema.JSONSchema["oneOf"], undefined> = [];
    for (const variant of oneOf) {
      if (typeof variant === "boolean") {
        expandedOneOf.push(variant);
        continue;
      }

      const property = variant.properties?.[propertyName];
      if (typeof property === "object" && property.enum) {
        for (const enumValue of property.enum) {
          const newVariant = {
            ...variant,
            properties: {
              ...variant.properties,
              [propertyName]: {
                ...property,
                const: enumValue,
              },
            },
          };
          delete (newVariant.properties[propertyName] as z.core.JSONSchema.JSONSchema).enum;
          expandedOneOf.push(newVariant);
        }
      } else {
        expandedOneOf.push(variant);
      }
    }
    schema.oneOf = expandedOneOf;
  }

  const finalOneOf = schema.oneOf ?? oneOf;
  for (const variant of finalOneOf) {
    if (typeof variant !== "boolean") processSchema(variant);
  }
};
