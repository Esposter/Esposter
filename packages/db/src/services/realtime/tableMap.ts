import type { Table } from "drizzle-orm";

import { getSchemaTables } from "#src/services/realtime/getSchemaTables";
import { getTableName } from "drizzle-orm";

// Relational SQL and a read set name their tables in text, so a table is found by its database name
export const tableMap = new Map<string, Table>(getSchemaTables().map((table) => [getTableName(table), table]));
