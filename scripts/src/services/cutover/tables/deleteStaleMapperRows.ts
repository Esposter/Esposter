import type { D1Statement } from "#src/models/cutover/D1Statement";
import type { MapperRowsOptions } from "#src/models/cutover/MapperRowsOptions";

import { writeStatements } from "#src/services/cutover/core/writeStatements";
import { z } from "zod";

const d1KeyValueSchema = z.union([z.string(), z.number(), z.null()]);

// Removes the rows of the entities Azure no longer lists. Every entity listed is mapped, and every row the table holds is compared
// with the primary keys those mappings give; a row none of them gives is removed. Returns how many rows were removed
export const deleteStaleMapperRows = async (options: MapperRowsOptions): Promise<number> => {
  const { coreTable, entities, executor, idMap, mapper, parents } = options;
  const keyNames = coreTable.primaryKeyColumns.map(({ name }) => name);
  const expectedKeys = new Set<string>();
  for await (const { entity, timestamp } of entities) {
    const values = mapper.map(entity, { idMap, parents, timestamp });
    if (values) expectedKeys.add(JSON.stringify(keyNames.map((name) => values[name])));
  }

  const rows = await executor.query({
    params: [],
    sql: `SELECT ${keyNames.map((name) => `"${name}"`).join(", ")} FROM "${coreTable.name}"`,
  });
  const where = keyNames.map((name) => `"${name}" = ?`).join(" AND ");
  const statements: D1Statement[] = [];
  for (const row of rows) {
    const keyValues = keyNames.map((name) => d1KeyValueSchema.parse(row[name]));
    if (!expectedKeys.has(JSON.stringify(keyValues)))
      statements.push({ params: keyValues, sql: `DELETE FROM "${coreTable.name}" WHERE ${where}` });
  }
  await writeStatements(executor, statements);
  return statements.length;
};
