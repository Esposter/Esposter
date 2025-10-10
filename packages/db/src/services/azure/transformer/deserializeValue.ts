import type { SerializableValue } from "@esposter/db-schema";

export const deserializeValue = (string: string): SerializableValue => {
  if (string === String(true)) return true;
  else if (string === String(false)) return false;
  else if (string === String(null)) return null;
  else if (Number.isFinite(+string)) return Number(string);
  else if (string === String(Number.NaN)) return Number.NaN;
  else if (string.startsWith("'") && string.endsWith("'")) return string.slice(1, -1);
  else {
    const date = new Date(string);
    if (Number.isNaN(date)) return string;
    else return date;
  }
};
