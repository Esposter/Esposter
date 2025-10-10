import type { SerializableValue } from "@esposter/db-schema";

import { escapeValue } from "@/services/azure/transformer/escapeValue";

export const serializeValue = (value: SerializableValue): string => {
  if (value instanceof Date) return value.toISOString();
  else if (typeof value === "string") return escapeValue(value);
  else return String(value);
};
