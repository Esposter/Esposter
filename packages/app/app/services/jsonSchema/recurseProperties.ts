import type { z } from "zod";

export const recurseProperties = (
  properties: z.core.JSONSchema.JSONSchema["properties"],
  {
    objectHooks = [],
    otherHooks = [],
  }: {
    objectHooks?: ((key: string, property: z.core.JSONSchema.JSONSchema) => void)[];
    otherHooks?: ((key: string, property: z.core.JSONSchema.JSONSchema) => void)[];
  } = {},
) => {
  if (!properties) return;
  for (const [key, property] of Object.entries(properties))
    if (typeof property === "boolean") continue;
    else if (property.type === "object") {
      for (const objectHook of objectHooks) objectHook(key, property);
      recurseProperties(property.properties, { objectHooks, otherHooks });
    } else for (const otherHook of otherHooks) otherHook(key, property);
};
