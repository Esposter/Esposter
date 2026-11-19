import type { StoredColumns } from "#src/models/topic/StoredColumns";

// The union of the columns held and the columns named now, where null names every column and absent names none yet
export const unionColumns = (stored: StoredColumns | undefined, columns: string[] | undefined): StoredColumns => {
  if (stored === undefined) return columns ?? null;
  if (stored === null || columns === undefined) return null;
  return [...new Set([...stored, ...columns])];
};
