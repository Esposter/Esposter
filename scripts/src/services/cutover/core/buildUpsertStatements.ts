import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Statement } from "#src/models/cutover/D1Statement";
import type { D1Value } from "#src/services/cutover/core/toD1Value";

import { D1_STATEMENT_BYTE_LIMIT, D1_STATEMENT_PARAMETER_LIMIT } from "#src/services/cutover/constants";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";

// Inserts rows as upserts keyed by the primary key. An upsert, not a delete and insert, because D1 cascades a delete into
// every row that references it, and the typed Azure rows reference the Postgres ones they are copied beside
export const buildUpsertStatements = (table: CoreTable, rows: D1Value[][]): D1Statement[] => {
  const columnNames = table.columns.map(({ name }) => quoteIdentifier(name));
  const keyNames = table.primaryKeyColumns.map(({ name }) => quoteIdentifier(name));
  const updateAssignments = table.columns
    .filter(({ name }) => !table.primaryKeyColumns.some((key) => key.name === name))
    .map(({ name }) => `${quoteIdentifier(name)} = excluded.${quoteIdentifier(name)}`);
  const conflictAction = updateAssignments.length > 0 ? `DO UPDATE SET ${updateAssignments.join(", ")}` : "DO NOTHING";
  const insertHead = `INSERT INTO ${quoteIdentifier(table.name)} (${columnNames.join(", ")}) VALUES `;
  const suffix = ` ON CONFLICT (${keyNames.join(", ")}) ${conflictAction}`;
  // A statement is cut before it would pass either D1 limit: its bound parameters, and the bytes of its SQL and values
  const rowsPerStatement = Math.max(1, Math.floor(D1_STATEMENT_PARAMETER_LIMIT / table.columns.length));
  const statements: D1Statement[] = [];
  let current: D1Value[][] = [];
  let currentBytes = insertHead.length + suffix.length;
  const flush = () => {
    if (current.length === 0) return;
    const placeholders = current.map((row) => `(${row.map(() => "?").join(", ")})`).join(", ");
    statements.push({ params: current.flat(), sql: `${insertHead}${placeholders}${suffix}` });
    current = [];
    currentBytes = insertHead.length + suffix.length;
  };
  for (const row of rows) {
    const rowBytes = row.reduce<number>((total, value) => total + String(value ?? "").length + 4, 0);
    if (current.length >= rowsPerStatement || currentBytes + rowBytes > D1_STATEMENT_BYTE_LIMIT) flush();
    current.push(row);
    currentBytes += rowBytes;
  }
  flush();
  return statements;
};
