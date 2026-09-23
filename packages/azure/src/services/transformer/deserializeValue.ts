import type { SerializableValue } from "#src/models/shared/SerializableValue";

import { DATETIME_LITERAL_PREFIX } from "#src/services/transformer/constants";
import { getResult } from "@esposter/shared";

// `Temporal.Instant` is the parser rather than `new Date`, which answers an impossible day with the day it
// Overflows into — 30 February reads as 2 March — and an unparseable string with an Invalid Date object
const parseIsoDate = (isoValue: string): Date | undefined =>
  getResult(() => new Date(Temporal.Instant.from(isoValue).epochMilliseconds)).unwrapOr(undefined);

export const deserializeValue = (serializedValue: string): SerializableValue => {
  if (serializedValue === String(true)) return true;
  else if (serializedValue === String(false)) return false;
  else if (serializedValue === String(null)) return null;
  else if (Number.isFinite(Number(serializedValue))) return Number(serializedValue);
  else if (serializedValue === String(Number.NaN)) return Number.NaN;
  // The inverse of the Azure Table datetime'<iso>' literal that serializeValue emits for table filters
  else if (serializedValue.startsWith(DATETIME_LITERAL_PREFIX) && serializedValue.endsWith("'"))
    return parseIsoDate(serializedValue.slice(DATETIME_LITERAL_PREFIX.length, -1)) ?? serializedValue;
  // The inverse of escapeValue: strip the delimiters, then undouble the quotes it doubled
  else if (serializedValue.startsWith("'") && serializedValue.endsWith("'"))
    return serializedValue.slice(1, -1).replaceAll("''", "'");
  else return parseIsoDate(serializedValue) ?? serializedValue;
};
