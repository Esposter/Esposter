import { processSchema } from "@/services/jsonSchema/processSchema";
import { z } from "zod";

const layoutProperties = ["comp", "getProps", "getItems"] as const;
const schemaKeywordProperties = ["uniqueColumnName"] as const;

export const zodToJsonSchema = (schema: z.ZodType) => {
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
      if (Object.keys(layout).length > 0) jsonSchema.layout = layout;

      for (const key of schemaKeywordProperties) {
        if (meta[key] !== undefined) (jsonSchema as Record<string, unknown>)[key] = meta[key];
      }
    },
  });
  processSchema(result);
  return result;
};
