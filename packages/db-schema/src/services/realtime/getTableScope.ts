import type { TableScope } from "#src/models/realtime/TableScope";
import type { Table } from "drizzle-orm";

import { TABLE_SCOPE_KEY } from "#src/services/realtime/constants";

// The scope a table declares, read off the table object `sqliteTable` wrote it to. Drizzle's table type has no slot for
// It, so the parameter names the slot's type itself: the one writer of the slot is `sqliteTable`, and an alias of a table
// Forwards the read to the table it aliases
export const getTableScope = (
  table: Table & { [TABLE_SCOPE_KEY]?: TableScope<string> },
): TableScope<string> | undefined => table[TABLE_SCOPE_KEY];
