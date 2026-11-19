import type { SQLiteTable } from "drizzle-orm/sqlite-core";

// A slot with its row type erased, the one form every table's slot takes in a map. The table's source is the identity a
// Typed slot is recovered by, since no parameter names a row type
export interface ErasedSlot {
  table: { source: SQLiteTable };
}
