import type { MockD1Database } from "#src/models/MockD1Database";

import { DRIZZLE_MIGRATIONS_TABLE, FTS5_SHADOW_TABLE_SUFFIXES } from "#src/services/constants";

interface SchemaRow {
  name: string;
  sql: string | null;
}

// Every table a reset empties: the user tables and the FTS5 virtual tables, but not SQLite's own bookkeeping, the
// migrator's ledger, or the shadow tables a virtual table keeps for itself
export const getEmptiableTableNames = async (database: MockD1Database): Promise<string[]> => {
  const { results } = await database
    .prepare("SELECT name, sql FROM sqlite_schema WHERE type = 'table'")
    .all<SchemaRow>();
  const shadowTableNames = results
    .filter(({ sql }) => sql?.startsWith("CREATE VIRTUAL TABLE") === true)
    .flatMap(({ name }) => FTS5_SHADOW_TABLE_SUFFIXES.map((suffix) => `${name}_${suffix}`));
  return results
    .map(({ name }) => name)
    .filter(
      (name) => !name.startsWith("sqlite_") && name !== DRIZZLE_MIGRATIONS_TABLE && !shadowTableNames.includes(name),
    );
};
