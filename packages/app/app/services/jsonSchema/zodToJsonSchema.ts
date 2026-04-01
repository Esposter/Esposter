import { uniqueColumnNameKeywordDefinition } from "@/services/ajv/keywords/uniqueColumnNameKeywordDefinition";
import { processSchema } from "@/services/jsonSchema/processSchema";
import { z } from "zod";

export const zodToJsonSchema = (schema: z.ZodType) => {
  // $schema is stripped because vjsf's internal Ajv2019 instance does not have the draft 2020-12 meta-schema loaded
  const { $schema: _, ...result } = z.toJSONSchema(schema, {
    override: (ctx) => {
      const zodSchema = ctx.zodSchema as z.ZodObject;
      const jsonSchema = ctx.jsonSchema as Record<string, unknown>;
      // Add discriminator for discriminated unions so vjsf auto-selects the active variant
      const def = zodSchema.def;
      if ("discriminator" in def && def.discriminator) jsonSchema.discriminator = { propertyName: def.discriminator };

      if (zodSchema.shape) {
        const required = jsonSchema.required as string[] | undefined;
        for (const [key, fieldSchema] of Object.entries(zodSchema.shape as Record<string, z.ZodType>)) {
          if (!fieldSchema.meta()?.isHidden) continue;
          delete (jsonSchema.properties as Record<string, unknown>)[key];
          if (!required) continue;
          const index = required.indexOf(key);
          if (index !== -1) required.splice(index, 1);
        }
        if (required?.length === 0) delete jsonSchema.required;
      }

      const meta = zodSchema.meta();
      if (!meta) return;
      if (meta.layout) jsonSchema.layout = meta.layout;
      if (meta[uniqueColumnNameKeywordDefinition.keyword]) {
        jsonSchema[uniqueColumnNameKeywordDefinition.keyword] = true;
        jsonSchema.errorMessage = { [uniqueColumnNameKeywordDefinition.keyword]: "Column already exists" };
      }
    },
  });
  processSchema(result);
  return result;
};
