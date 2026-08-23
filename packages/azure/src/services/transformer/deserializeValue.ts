import type { SerializableValue } from "#src/models/SerializableValue";

export const deserializeValue = (string: string): SerializableValue => {
  if (string === String(true)) return true;
  else if (string === String(false)) return false;
  else if (string === String(null)) return null;
  else if (Number.isFinite(Number(string))) return Number(string);
  else if (string === String(Number.NaN)) return Number.NaN;
  // The inverse of the Azure Table datetime'<iso>' literal that serializeValue emits for table filters
  else if (string.startsWith("datetime'") && string.endsWith("'"))
    return new Date(string.slice("datetime'".length, -1));
  // The inverse of escapeValue: strip the delimiters, then undouble the quotes it doubled
  else if (string.startsWith("'") && string.endsWith("'")) return string.slice(1, -1).replaceAll("''", "'");
  else {
    const date = new Date(string);
    if (Number.isNaN(date)) return string;
    else return date;
  }
};
