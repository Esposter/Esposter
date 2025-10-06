import type { SerializableValue } from "@/models/azure/SerializableValue";

export const deserializeValue = (string: string): SerializableValue => {
  if (string === String(null)) return null;
  else if (string === String(Number.NaN)) return Number.NaN;
  else if (string.startsWith("'") && string.endsWith("'")) return string.slice(1, -1);
  else return string;
};
