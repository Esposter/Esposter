import type { Database, StorageBucket, StorageLedgerEntryInStorage, UserInAuth } from "@esposter/db-schema";

import { emitStorageUsage } from "#server/services/storage/emitStorageUsage";
import { chargeStorageLedgerEntry } from "@esposter/db";

export const chargeAndEmitStorageLedgerEntry = async (
  db: Database,
  userId: UserInAuth["id"],
  storageBucket: StorageBucket,
  blobName: StorageLedgerEntryInStorage["blobName"],
  actualBytes: number,
): Promise<void> => {
  await chargeStorageLedgerEntry(db, userId, storageBucket, blobName, actualBytes);
  await emitStorageUsage(db, userId);
};
