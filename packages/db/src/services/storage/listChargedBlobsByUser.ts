import type { AzureContainer, Database, UserInAuth } from "@esposter/db-schema";

// The exact list of blobs a user is charged for, read from the storage ledger rather than from a listing of names:
// The ledger holds one row per charged blob with its container and owner, so a sweep removes what it was charged for
// And nothing else. Grouped by container, so each container's blobs go out together.
export const listChargedBlobsByUser = async (
  db: Database,
  userId: UserInAuth["id"],
): Promise<Map<AzureContainer, string[]>> => {
  const storageLedgerEntries = await db.query.storageLedgerInStorage.findMany({
    columns: { blobName: true, containerName: true },
    where: { userId: { eq: userId } },
  });
  const containerStorageLedgerEntriesMap = Map.groupBy(storageLedgerEntries, ({ containerName }) => containerName);
  return new Map(
    Array.from(
      containerStorageLedgerEntriesMap,
      ([containerName, storageLedgerEntriesInContainer]) =>
        [containerName, storageLedgerEntriesInContainer.map(({ blobName }) => blobName)] as const,
    ),
  );
};
