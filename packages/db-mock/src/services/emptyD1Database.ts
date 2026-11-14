import type { MockD1Database } from "#src/models/MockD1Database";

import { getEmptiableTableNames } from "#src/services/getEmptiableTableNames";

// D1 has no truncate. Each delete runs in one batch, which is a transaction, with foreign keys checked at its commit
// Rather than per statement, so a parent's delete is not refused while its children are still in the table
export const emptyD1Database = async (database: MockD1Database): Promise<void> => {
  const tableNames = await getEmptiableTableNames(database);
  await database.batch([
    database.prepare("PRAGMA defer_foreign_keys = ON"),
    ...tableNames.map((tableName) => database.prepare(`DELETE FROM "${tableName}"`)),
  ]);
};
