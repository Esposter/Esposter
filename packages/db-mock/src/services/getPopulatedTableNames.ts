import type { MockD1Database } from "#src/models/MockD1Database";

// One statement asks every emptiable table whether it holds a row, one column each, so a reset deletes only the tables
// A test wrote to. Deleting from an empty table changes nothing, so a skipped table ends as empty as a deleted one
export const getPopulatedTableNames = async (database: MockD1Database, tableNames: string[]): Promise<string[]> => {
  if (tableNames.length === 0) return [];
  const row = await database
    .prepare(
      `SELECT ${tableNames.map((tableName) => `EXISTS (SELECT 1 FROM "${tableName}") AS "${tableName}"`).join(", ")}`,
    )
    .first<Record<string, number>>();
  return tableNames.filter((tableName) => row?.[tableName] === 1);
};
