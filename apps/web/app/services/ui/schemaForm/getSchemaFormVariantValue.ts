import type { SchemaFormLayout } from "#shared/models/schemaForm/SchemaFormLayout";
import type { JsonSchema } from "@jsonforms/core";

import { createDefaultValue } from "@jsonforms/core";

const getItemsKey = (property: JsonSchema | undefined) =>
  (property as undefined | { layout?: SchemaFormLayout })?.layout?.itemsKey;
// A union switched to another variant keeps what the reader filled in that the new variant has too, and anything the
// Schema does not describe — a column's id — while the fields only the other variants have go, and the new variant's
// Fixed discriminant is set. A shared field picked from a different list of the context goes too: a number column
// Kept by a variant that picks among string columns is a choice the new picker never offered
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
  if (typeof data === "object" && data !== null) {
    const sourceProperties =
      variants.find(({ properties }) =>
        Object.entries(properties ?? {}).every(
          ([key, property]) => property.const === undefined || Reflect.get(data, key) === property.const,
        ),
      )?.properties ?? {};
    for (const [key, keyValue] of Object.entries(data))
      if (!otherVariantKeys.has(key) && getItemsKey(sourceProperties[key]) === getItemsKey(variantProperties[key]))
        value[key] = keyValue;
  }
  for (const [key, property] of Object.entries(variantProperties))
    if (property.const !== undefined) value[key] = property.const;
  return value;
};
