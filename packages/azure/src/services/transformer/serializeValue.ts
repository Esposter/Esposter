import type { SerializableValue } from "@esposter/db-schema";

import { escapeValue } from "#src/services/transformer/escapeValue";

// Azure Search filters take a Date as the bare ISO string, and every other value serializes as its literal
export const serializeValue = (value: SerializableValue): string => {
  if (value instanceof Date) return value.toISOString();
  else if (typeof value === "string") return escapeValue(value);
  else return String(value);
};
