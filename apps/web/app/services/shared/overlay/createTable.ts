import type { RowKey } from "#src/models/shared/overlay/RowKey";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { getTableName } from "drizzle-orm";

// The overlay's table over a Drizzle table. The name and the identity both come from the table object, which the schema
// Holds once, so every Table made over it shares one slot
export const createTable = <TRow extends Versioned>(
  source: SQLiteTable,
  keyOf: (row: TRow) => RowKey,
): Table<TRow> => ({ keyOf, name: getTableName(source), source });
