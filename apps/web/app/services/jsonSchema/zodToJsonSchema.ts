import { RESOURCE_LINK_TYPE_KEYWORD } from "#shared/services/resource/link/constants";
import { resourceLinkRegistry } from "#shared/services/resource/link/resourceLinkRegistry";
import { processSchema } from "#src/services/jsonSchema/processSchema";
import { z } from "zod";

export const zodToJsonSchema = (schema: z.ZodType) => {
  // Strip $schema: JSON Forms' Ajv validates draft 7 and has no meta-schema for the draft 2020-12 Zod names
  const { $schema: _schema, ...result } = z.toJSONSchema(schema, {
    override: (context) => {
      const meta = z.globalRegistry.get(context.zodSchema);
      if (meta?.layout) Object.assign(context.jsonSchema, { layout: meta.layout });
      // A link lives in its own registry, which the layout is not read from, so its type is carried beside the layout
      const resourceLinkType = resourceLinkRegistry.get(context.zodSchema)?.resourceLinkType;
      if (resourceLinkType) Object.assign(context.jsonSchema, { [RESOURCE_LINK_TYPE_KEYWORD]: resourceLinkType });
    },
  });
  processSchema(result);
  return result;
};
