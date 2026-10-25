import { resourceLinkRegistry } from "#shared/services/resource/link/resourceLinkRegistry";
import { processSchema } from "@/services/jsonSchema/processSchema";
import { z } from "zod";

export const zodToJsonSchema = (schema: z.ZodType) => {
  // Strip $schema: JSON Forms' Ajv validates draft 7 and has no meta-schema for the draft 2020-12 Zod names
  const { $schema: _schema, ...result } = z.toJSONSchema(schema, {
    override: (context) => {
      const jsonSchema = context.jsonSchema as Record<string, unknown>;
      const meta = z.globalRegistry.get(context.zodSchema);
      if (meta?.layout) jsonSchema.layout = meta.layout;
      // A link lives in its own registry, which the layout is not read from, so its type is carried beside the layout
      const resourceLinkType = resourceLinkRegistry.get(context.zodSchema)?.resourceLinkType;
      if (resourceLinkType) jsonSchema.resourceLinkType = resourceLinkType;
    },
  });
  processSchema(result);
  return result;
};
