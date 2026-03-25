import { recurseProperties } from "@/services/jsonSchema/recurseProperties";
import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";
import { z } from "zod";

export const zodToJsonSchema = (schema: z.ZodObject) => {
  // Only get the minimal information required to integrate with vjsf
  const { properties, required, type } = z.toJSONSchema(schema, {
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
  return { properties, required, type };
};
