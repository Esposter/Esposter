import type { MockD1Database } from "#src/models/MockD1Database";

import { getEmptiableTableNames } from "#src/services/getEmptiableTableNames";
import { schema } from "@esposter/db-schema";
import { getTableName, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

// D1 has no truncate. Each delete runs in one batch, which is a transaction, with foreign keys checked at its commit
// Rather than per statement, so a parent's delete is not refused while its children are still in the table. A table the
// Schema declares is deleted through the Drizzle builder. A full-text table is not declared, so its delete is the one raw
// Statement, over a table nothing tracks
export const emptyD1Database = async (database: MockD1Database): Promise<void> => {
  const tableNames = await getEmptiableTableNames(database);
  const db = drizzle(database);
  const declaredTables = Object.values(schema);
  const declaredNames = new Set<string>(declaredTables.map((table) => getTableName(table)));
  await db.batch([
    db.run(sql`PRAGMA defer_foreign_keys = ON`),
    ...declaredTables.filter((table) => tableNames.includes(getTableName(table))).map((table) => db.delete(table)),
    ...tableNames
      .filter((tableName) => !declaredNames.has(tableName))
      .map((tableName) => db.run(sql.raw(`DELETE FROM "${tableName}"`))),
  ]);
};
