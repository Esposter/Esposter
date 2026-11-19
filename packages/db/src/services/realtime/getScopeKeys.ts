import type { Table } from "drizzle-orm";

import { getTableScope } from "@esposter/db-schema";

// The keys of a table's scope columns, the keys a topic names a row by. A secret column is one of them
export const getScopeKeys = (table: Table): string[] => getTableScope(table)?.columns ?? [];
