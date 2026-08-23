import type { SerializableValue } from "#src/models/SerializableValue";

import { escapeValue } from "#src/services/transformer/escapeValue";

// Azure Table Storage OData requires DateTime comparisons wrapped as datetime'<iso>' literals; Azure
// Search filters take the bare ISO string. isTableFilter selects the Date rendering the target service
// Expects while every other value type serializes identically for both.
export const serializeValue = (value: SerializableValue, isTableFilter = false): string => {
  if (value instanceof Date) return isTableFilter ? `datetime'${value.toISOString()}'` : value.toISOString();
  else if (typeof value === "string") return escapeValue(value);
  else return String(value);
};
