import type { MockD1Database } from "#src/models/MockD1Database";

import { getEmptiableTableNames } from "#src/services/getEmptiableTableNames";
import { schema } from "@esposter/db-schema";
import { getTableName, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

// One statement asks every emptiable table whether it holds a row, one column each, so a reset deletes only the tables
// A test wrote to. Deleting from an empty table changes nothing, so a skipped table ends as empty as a deleted one
const getPopulatedTableNames = async (database: MockD1Database, tableNames: string[]): Promise<string[]> => {
  if (tableNames.length === 0) return [];
  const row = await database
    .prepare(
      `SELECT ${tableNames.map((tableName) => `EXISTS (SELECT 1 FROM "${tableName}") AS "${tableName}"`).join(", ")}`,
    )
    .first<Record<string, number>>();
  return tableNames.filter((tableName) => row?.[tableName] === 1);
};

// D1 has no truncate.
// Each delete runs in one batch, which is a transaction, so foreign keys are checked at its commit, not per statement.
// A parent's delete is therefore not refused while its children are still in the table.
// A table the schema declares is deleted through the Drizzle builder.
// A full-text table is not declared, so its delete is the one raw statement, over a table nothing tracks.
export const emptyD1Database = async (database: MockD1Database): Promise<void> => {
  const populatedTableNames = await getPopulatedTableNames(database, await getEmptiableTableNames(database));
  const db = drizzle(database);
  const declaredTables = Object.values(schema);
  const declaredNames = new Set<string>(declaredTables.map((table) => getTableName(table)));
  await db.batch([
    db.run(sql`PRAGMA defer_foreign_keys = ON`),
    ...declaredTables
      .filter((table) => populatedTableNames.includes(getTableName(table)))
      .map((table) => db.delete(table)),
    ...populatedTableNames
      .filter((tableName) => !declaredNames.has(tableName))
      .map((tableName) => db.run(sql.raw(`DELETE FROM "${tableName}"`))),
  ]);
};
