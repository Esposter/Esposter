import type { Table } from "drizzle-orm";

import { getScopeKeys } from "#src/services/realtime/getScopeKeys";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { getTableColumns } from "drizzle-orm";

// How a recorded write answers its caller for the projection the caller asked for, keyed by the recorded statement the caller holds
export const returnedAnswers = new WeakMap<object, (result: unknown) => unknown>();

// A write's RETURNING names the scope values of the rows it returns, and its topics are keyed by them. So the projection is widened
// With the table's scope columns the caller did not ask for, here rather than in each caller, which would have to remember to ask for
// Them. The caller is answered only the columns it asked for, and a projection that already holds every scope column is left as it is
export const widenReturning = (
  table: Table,
  fields: Record<string, unknown>,
): { answer?: (result: unknown) => unknown; fields: Record<string, unknown> } => {
  const columns = getTableColumns(table);
  const added = getScopeKeys(table).filter((key) => !(key in fields) && columns[key] !== undefined);
  if (added.length === 0) return { fields };
  const keys = Object.keys(fields);
  const pick = (row: unknown) => (checkIsRecord(row) ? Object.fromEntries(keys.map((key) => [key, row[key]])) : row);
  return {
    answer: (result) => (Array.isArray(result) ? result.map((row) => pick(row)) : pick(result)),
    fields: { ...fields, ...Object.fromEntries(added.map((key) => [key, columns[key]])) },
  };
};

// The result a recorded statement answers its caller with: the rows it resolved to, projected to the columns the caller asked for
export const answerReturned = (statement: object, result: unknown): unknown => {
  const answer = returnedAnswers.get(statement);
  return answer ? answer(result) : result;
};
