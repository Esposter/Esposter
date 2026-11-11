import type { JsonSchema } from "@jsonforms/core";

// The variant a union's data is in is the one whose fixed discriminants it carries. JSON Forms picks it by validating
// The data against each variant instead, which fails for data the form schema does not describe, a column's id, and for
// A field being cleared past its minimum length, and then no variant is drawn at all. Only a union with no fixed
// Discriminant at all falls back to JSON Forms' pick, or the first variant while it has none
export const getSchemaFormVariantIndex = (data: unknown, variants: JsonSchema[], fittingIndex = 0) => {
  const discriminatedIndex = variants.findIndex(({ properties }) => {
    const constEntries = Object.entries(properties ?? {}).filter(([, property]) => property.const !== undefined);
    return (
      constEntries.length > 0 &&
      typeof data === "object" &&
      data !== null &&
      constEntries.every(([key, property]) => Reflect.get(data, key) === property.const)
    );
  });
  if (discriminatedIndex !== -1) return discriminatedIndex;

  return Number.isInteger(fittingIndex) ? Math.max(fittingIndex, 0) : 0;
};
