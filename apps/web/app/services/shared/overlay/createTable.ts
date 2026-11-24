import type { Table } from "#src/models/shared/overlay/Table";
import type { TableSource } from "#src/models/shared/overlay/TableSource";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { checkIsKeyValue } from "#src/services/shared/overlay/checkIsKeyValue";
import { checkIsRowField } from "#src/services/shared/overlay/checkIsRowField";
import { createKeyOfScope } from "#src/services/shared/overlay/createKeyOfScope";
import { listKeyFieldNames } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { getTableName } from "drizzle-orm";

// The overlay's table over a Drizzle table. The row is the table's select model, or a projection of it that a caller
// Names when a read returns only some of the columns, which must be columns of the table. The key is read from its
// Primary key, so a caller names nothing. A write's header names each row by the same fields, so the key a header row
// Carries is the key the row is held by. The schema holds the table object once, so every Table made over it shares one
// Slot
export const createTable = <
  TSource extends TableSource,
  TRow extends Partial<TSource["$inferSelect"]> & Versioned = TSource["$inferSelect"],
>(
  source: TSource,
): Table<TRow, TSource> => {
  const keyFieldNames = listKeyFieldNames(source);
  return {
    // A primary key's value is a string or a number, and every row holds each of its key fields, so a row holding
    // Neither a string nor a number under one is a broken row rather than a key to skip
    keyOf: (row) =>
      keyFieldNames.map((fieldName) => {
        const value = checkIsRowField(row, fieldName) ? row[fieldName] : undefined;
        if (checkIsKeyValue(value)) return value;

        throw new InvalidOperationError(
          Operation.Read,
          fieldName,
          "a key field of the row holds neither a string nor a number",
        );
      }),
    keyOfScope: createKeyOfScope(keyFieldNames),
    name: getTableName(source),
    source,
  };
};
