import type { ResourceInResource } from "@esposter/db-schema";

// The row of a resource the overlay holds, out of the rows it holds. A client-created row has no version, and none is held as one,
// So only a row a read or write has landed is taken, which is what the guard states
export const getHeldResource = <TRow extends { id: string; version?: number }>(rows: readonly TRow[], id: string) =>
  rows.find((row): row is ResourceInResource & TRow => row.id === id && row.version !== undefined);
