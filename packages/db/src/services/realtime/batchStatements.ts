import type { Database } from "@esposter/db-schema";

// A query a batch runs. Drizzle does not export its batch item type, so it is read off the database's own `batch`
export type BatchItem = Parameters<Database["batch"]>[0][number];

// Runs the items of one batch, in order, and resolves to their results in the same order. The items are drizzle queries
// Of any kind, so they are handed over as they are, which the batch's own tuple type cannot take from a list
export const batchStatements = (database: Database, items: unknown[]): Promise<unknown[]> =>
  /* oxlint-disable-next-line typescript/no-unsafe-type-assertion -- drizzle's batch takes a non-empty tuple of its own
     statement types, and the statements are a list built at run time */
  database.batch(items as [BatchItem, ...BatchItem[]]);
