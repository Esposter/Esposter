import type { AzureContainer, Database, StorageLedgerEntry, User } from "@esposter/db-schema";

import { emitStorageUsage } from "@@/server/services/storage/emitStorageUsage";
import { chargeStorageLedgerEntry } from "@esposter/db";

export const chargeAndEmitStorageLedgerEntry = async (
  db: Database,
  userId: User["id"],
  containerName: AzureContainer,
  blobName: StorageLedgerEntry["blobName"],
  actualBytes: number,
): Promise<void> => {
  await chargeStorageLedgerEntry(db, userId, containerName, blobName, actualBytes);
  await emitStorageUsage(db, userId);
};
