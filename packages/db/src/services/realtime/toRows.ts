import { checkIsRecord } from "@esposter/shared";

// The rows a statement resolved to: a list as it is, a single row (a relational `findFirst`) as a list of one, and
// Nothing for a count, an absent row or a write's run result, which names no row
export const toRows = (result: unknown): unknown[] => {
  if (Array.isArray(result)) return result;
  return checkIsRecord(result) ? [result] : [];
};
