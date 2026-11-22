import type { BatchItem } from "#src/services/realtime/batchStatements";
import type { Database } from "@esposter/db-schema";
import type { SQLWrapper, Table } from "drizzle-orm";

import { getRemovalConditions } from "#src/services/realtime/getRemovalConditions";
import { getScopeKeys } from "#src/services/realtime/getScopeKeys";
import { getStatementConfig } from "#src/services/realtime/getStatementConfig";
import { getWriteTable } from "#src/services/realtime/getWriteTable";
import { checkIsRecord } from "@esposter/shared";
import { getTableColumns, is, SQL } from "drizzle-orm";
import { SQLiteDeleteBase, SQLiteUpdateBase } from "drizzle-orm/sqlite-core";

// A read a write makes before it runs, and the table whose rows it reads
export interface BeforeRead {
  select: BatchItem;
  table: Table;
}

// The reads a write needs before it runs, so the values its rows hold before it are named with the values they hold after
// It. An update reads the rows its WHERE matches, when its SET writes a scope column. A delete reads the rows each table it
// Cascades to holds, and the rows of each table a key sets null or to its default changes, so the children that RETURNING
// Does not report are named by their own scope values. A statement that is not a write needs none
export const getBeforeReads = (database: Database, statement: SQLWrapper): BeforeRead[] => {
  if (is(statement, SQLiteUpdateBase)) return getUpdateBeforeReads(database, statement);
  if (is(statement, SQLiteDeleteBase)) return getDeleteBeforeReads(database, statement);
  return [];
};

const getUpdateBeforeReads = (database: Database, statement: SQLWrapper): BeforeRead[] => {
  const table = getWriteTable(statement);
  const config = getStatementConfig(statement);
  const set = config?.set;
  if (!table || !checkIsRecord(set)) return [];
  const scopeKeys = getScopeKeys(table);
  if (!Object.keys(set).some((key) => scopeKeys.includes(key))) return [];
  return [{ select: selectScope(database, table, scopeKeys, getWhere(config)), table }];
};

const getDeleteBeforeReads = (database: Database, statement: SQLWrapper): BeforeRead[] => {
  const table = getWriteTable(statement);
  if (!table) return [];
  const { changedConditions, conditionOf, removedTables } = getRemovalConditions(
    database,
    table,
    getWhere(getStatementConfig(statement)),
  );
  const removedReads = removedTables.map((removedTable) => ({
    condition: conditionOf(removedTable),
    table: removedTable,
  }));
  return [...removedReads, ...changedConditions].flatMap(({ condition, table: readTable }) => {
    const scopeKeys = getScopeKeys(readTable);
    // A table with no condition is not walked, and one with no scope column holds nothing a topic names
    return condition === undefined || scopeKeys.length === 0
      ? []
      : [{ select: selectScope(database, readTable, scopeKeys, condition), table: readTable }];
  });
};

const getWhere = (config: Record<string, unknown> | undefined): SQL | undefined => {
  const where = config?.where;
  return is(where, SQL) ? where : undefined;
};

// The scope columns of a table's rows that match a condition, keyed as the table's definition keys them
const selectScope = (database: Database, table: Table, scopeKeys: string[], where: SQL | undefined) => {
  const columns = Object.entries(getTableColumns(table)).filter(([key]) => scopeKeys.includes(key));
  return database.select(Object.fromEntries(columns)).from(table).where(where);
};
