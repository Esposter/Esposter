import { processSchema } from "@/services/jsonSchema/processSchema";
import { z } from "zod";

export const zodToJsonSchema = (schema: z.ZodType) => {
  // Strip $schema: JSON Forms' Ajv validates draft 7 and has no meta-schema for the draft 2020-12 Zod names
  const { $schema: _schema, ...result } = z.toJSONSchema(schema, {
    override: (context) => {
      const meta = z.globalRegistry.get(context.zodSchema);
      if (meta?.layout) (context.jsonSchema as Record<string, unknown>).layout = meta.layout;
    },
  });
  processSchema(result);
  return result;
};
