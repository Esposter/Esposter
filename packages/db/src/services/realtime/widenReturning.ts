import type { SQLWrapper, Table } from "drizzle-orm";

import { checkIsStatement } from "#src/services/realtime/checkIsStatement";
import { getStatementConfig } from "#src/services/realtime/getStatementConfig";
import { getWidenedKeys } from "#src/services/realtime/getWidenedKeys";
import { getWriteTable } from "#src/services/realtime/getWriteTable";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { getTableColumns } from "drizzle-orm";

// How a recorded write answers its caller for the projection the caller asked for, keyed by the recorded statement the caller holds
export const statementAnswerMap = new WeakMap<object, (result: unknown) => unknown>();

// A write's RETURNING names the scope values of the rows it returns, and its topics are keyed by them, and its row versions carry
// The version it left each row at. So the projection is widened with those columns the caller did not ask for, here rather than
// In each caller, which would have to remember to ask for them. The caller is answered only the columns it asked for, and a
// Projection that already holds every widened column is left as it is
export const widenReturning = (
  table: Table,
  fields: Record<string, unknown>,
): { answer?: (result: unknown) => unknown; fields: Record<string, unknown> } => {
  const columns = getTableColumns(table);
  const added = getWidenedKeys(table).filter((key) => !(key in fields) && columns[key] !== undefined);
  if (added.length === 0) return { fields };
  const keys = Object.keys(fields);
  const pick = (row: unknown) => (checkIsRecord(row) ? Object.fromEntries(keys.map((key) => [key, row[key]])) : row);
  return {
    answer: (result) => (Array.isArray(result) ? result.map((row) => pick(row)) : pick(result)),
    fields: { ...fields, ...Object.fromEntries(added.map((key) => [key, columns[key]])) },
  };
};

// A write that asks for no RETURNING runs as one that returns its table's widened columns, so the rows it changes are named by the
// Values they hold after it, whatever its WHERE matched. Its caller asked for no rows, so it is answered none. A statement that is
// Not a write, or a table with no scope column, runs as it is
export const widenUnreturnedWrite = (
  statement: PromiseLike<unknown> & SQLWrapper,
): { answer?: (result: unknown) => unknown; statement: PromiseLike<unknown> & SQLWrapper } => {
  const table = getWriteTable(statement);
  if (!table || getStatementConfig(statement)?.returning !== undefined) return { statement };
  const columns = getTableColumns(table);
  const widenedKeys = getWidenedKeys(table).filter((key) => columns[key] !== undefined);
  if (widenedKeys.length === 0) return { statement };
  const fields = Object.fromEntries(widenedKeys.map((key) => [key, columns[key]]));
  const widened: unknown = Reflect.apply(Reflect.get(statement, "returning", statement), statement, [fields]);
  return checkIsStatement(widened) ? { answer: () => undefined, statement: widened } : { statement };
};

// The result a recorded statement answers its caller with: the rows it resolved to, projected to the columns the caller asked for
export const answerReturned = (statement: object, result: unknown): unknown => {
  const answer = statementAnswerMap.get(statement);
  return answer ? answer(result) : result;
};
