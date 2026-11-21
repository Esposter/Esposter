import type { RowKey } from "#src/models/shared/overlay/RowKey";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { RowVersion } from "@esposter/db-schema";

// The key one table's row takes from a write's header, which the client confirms its entry by and the cross-check reads the
// Same way. A row of another table names none
export const getHeaderRowKey = (
  table: Pick<Table<Versioned>, "keyOfScope" | "name">,
  { key, table: tableName }: RowVersion,
): RowKey | undefined => (tableName === table.name ? table.keyOfScope(key) : undefined);
