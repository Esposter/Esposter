import type { Transaction } from "@@/server/models/db/Transaction";
import type { Resource } from "@esposter/db-schema";

import { sql } from "drizzle-orm";

// A resource's object writes and its collections take one lock, for the length of the transaction. A write
// Makes its object durable before the row that names it exists, and a collection reads the rows to learn what
// Is retained — so between the two, an eviction that released the same hash would find nothing naming it and
// Delete the object the row about to be inserted depends on. Held across both, a collection sees the row or
// Runs before the object it would have freed is even chosen, and a write finds its anchor gone rather than
// Losing it a moment later. Transaction-scoped, so it is released by the commit or the rollback and never
// Leaks; keyed on the id's hash, so unrelated resources never wait on each other
export const lockSnapshotObjects = async (tx: Transaction, resourceId: Resource["id"]): Promise<void> => {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${resourceId}))`);
};
