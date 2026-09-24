import type { JsonSchema } from "@jsonforms/core";

import { createDefaultValue } from "@jsonforms/core";

// A union switched to another variant keeps what the reader filled in that the new variant has too, and anything the
// Schema does not describe — a column's id — while the fields only the other variants have go, and the new variant's
// Fixed discriminant is set
export const getSchemaFormVariantValue = (
  data: unknown,
  variants: JsonSchema[],
  variant: JsonSchema,
  rootSchema: JsonSchema,
) => {
  const variantProperties = variant.properties ?? {};
  const otherVariantKeys = new Set(
    variants.flatMap(({ properties }) => Object.keys(properties ?? {})).filter((key) => !(key in variantProperties)),
  );
  const value: Record<string, unknown> = { ...createDefaultValue(variant, rootSchema) };
  if (typeof data === "object" && data !== null)
    for (const [key, keyValue] of Object.entries(data)) if (!otherVariantKeys.has(key)) value[key] = keyValue;
  for (const [key, property] of Object.entries(variantProperties))
    if (property.const !== undefined) value[key] = property.const;
  return value;
};
