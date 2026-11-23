import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

// A Drizzle table whose select model is a versioned row, which is the only kind of table the overlay holds
export type TableSource = { $inferSelect: Versioned } & SQLiteTable;
