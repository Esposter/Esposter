import type { KeyValue } from "#src/models/shared/overlay/KeyValue";
import type { RowKey } from "#src/models/shared/overlay/RowKey";

// A scope names a row by one value per key field, in key order, when the scope holds each of them.
// Each value is typed as the column holds it.
// A scope missing one names no row.
export const createKeyOfScope =
  (keyFieldNames: string[]) =>
  (scope: Record<string, KeyValue>): RowKey | undefined => {
    const key = keyFieldNames.map((fieldName) => scope[fieldName]);
    return key.every((value): value is KeyValue => value !== undefined) ? key : undefined;
  };
