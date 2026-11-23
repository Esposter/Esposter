import type { KeyValue } from "#src/models/shared/overlay/KeyValue";
import type { RowKey } from "#src/models/shared/overlay/RowKey";

// The key a scope names a row by, when the row's key is its key fields and the scope holds each of them: one value per
// Key Field, in key order, each typed as the column holds it. A scope missing one names no row
export const createKeyOfScope =
  (keyFieldNames: string[]) =>
  (scope: Record<string, KeyValue>): RowKey | undefined => {
    const key = keyFieldNames.map((fieldName) => scope[fieldName]);
    return key.every((value): value is KeyValue => value !== undefined) ? key : undefined;
  };
