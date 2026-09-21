import type { SerializableValue } from "#src/models/shared/SerializableValue";

export const deserializeValue = (serializedValue: string): SerializableValue => {
  if (serializedValue === String(true)) return true;
  else if (serializedValue === String(false)) return false;
  else if (serializedValue === String(null)) return null;
  else if (Number.isFinite(Number(serializedValue))) return Number(serializedValue);
  else if (serializedValue === String(Number.NaN)) return Number.NaN;
  // The inverse of the Azure Table datetime'<iso>' literal that serializeValue emits for table filters
  else if (serializedValue.startsWith("datetime'") && serializedValue.endsWith("'"))
    return new Date(serializedValue.slice("datetime'".length, -1));
  // The inverse of escapeValue: strip the delimiters, then undouble the quotes it doubled
  else if (serializedValue.startsWith("'") && serializedValue.endsWith("'"))
    return serializedValue.slice(1, -1).replaceAll("''", "'");
  else {
    const date = new Date(serializedValue);
    // `Number.isNaN` never coerces, so the Date object itself is asked whether its time is a number
    if (Number.isNaN(date.getTime())) return serializedValue;
    else return date;
  }
};
