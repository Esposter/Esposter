import type { AzureContainer, Database, StorageLedgerEntryInStorage, UserInAuth } from "@esposter/db-schema";

import { emitStorageUsage } from "@@/server/services/storage/emitStorageUsage";
import { chargeStorageLedgerEntry } from "@esposter/db";

export const chargeAndEmitStorageLedgerEntry = async (
  db: Database,
  userId: UserInAuth["id"],
  containerName: AzureContainer,
  blobName: StorageLedgerEntryInStorage["blobName"],
  actualBytes: number,
): Promise<void> => {
  await chargeStorageLedgerEntry(db, userId, containerName, blobName, actualBytes);
  await emitStorageUsage(db, userId);
};
