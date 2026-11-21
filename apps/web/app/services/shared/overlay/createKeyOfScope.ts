import type { RowKey } from "#src/models/shared/overlay/RowKey";

// The key a scope names a row by, when the row's key is its key fields and the scope holds each of them: one value per key
// Field, in key order. A scope missing one names no row
export const createKeyOfScope =
  (keyFieldNames: string[]) =>
  (scope: Record<string, string>): RowKey | undefined => {
    const key = keyFieldNames.map((fieldName) => scope[fieldName]);
    return key.every((value): value is string => value !== undefined) ? key : undefined;
  };
