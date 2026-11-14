import type { D1Executor } from "#src/models/cutover/D1Executor";

import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { storageLedgerInStorage } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { getTableConfig } from "drizzle-orm/sqlite-core";

// Each user's ledger total must equal the bytes of the objects the reconciled ledger rows name.
// A row names its object by its bucket and blob name, and an object the bucket does not hold counts as zero bytes, which is what makes a missing one a difference
export const verifyStorageLedger = async (executor: D1Executor, objectSizes: Map<string, number>): Promise<void> => {
  const tableName = getTableConfig(storageLedgerInStorage).name;
  const rows = await executor.query({
    params: [],
    sql: `SELECT ${["containerName", "blobName", "userId", "countedBytes"].map((name) => quoteIdentifier(name)).join(", ")} FROM ${quoteIdentifier(tableName)} WHERE ${quoteIdentifier("reconciledAt")} IS NOT NULL`,
  });
  const ledgerTotals = new Map<string, number>();
  const objectTotals = new Map<string, number>();
  for (const row of rows) {
    const userId = String(row.userId);
    ledgerTotals.set(userId, (ledgerTotals.get(userId) ?? 0) + Number(row.countedBytes));
    const objectKey = `${String(row.containerName)}/${String(row.blobName)}`;
    objectTotals.set(userId, (objectTotals.get(userId) ?? 0) + (objectSizes.get(objectKey) ?? 0));
  }
  for (const [userId, ledgerTotal] of ledgerTotals) {
    const objectTotal = objectTotals.get(userId) ?? 0;
    if (ledgerTotal !== objectTotal)
      throw new InvalidOperationError(
        Operation.Read,
        "storageLedger",
        `user ${userId} is charged ${ledgerTotal} bytes but holds ${objectTotal}`,
      );
  }
};
