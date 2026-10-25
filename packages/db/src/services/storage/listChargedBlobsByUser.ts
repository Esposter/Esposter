import type { AzureContainer, Database, UserInAuth } from "@esposter/db-schema";

// The exact list of blobs a user is charged for, read from the storage ledger rather than from a listing of names:
// the ledger holds one row per charged blob with its container and owner, so a sweep removes what it was charged for
// and nothing else. Grouped by container, so each container's blobs go out together.
export const listChargedBlobsByUser = async (
  db: Database,
  userId: UserInAuth["id"],
): Promise<Map<AzureContainer, string[]>> => {
  const storageLedgerEntries = await db.query.storageLedgerInStorage.findMany({
    columns: { blobName: true, containerName: true },
    where: { userId: { eq: userId } },
  });
  const storageLedgerEntriesByContainer = Map.groupBy(storageLedgerEntries, ({ containerName }) => containerName);
  return new Map(
    Array.from(
      storageLedgerEntriesByContainer,
      ([containerName, storageLedgerEntriesInContainer]) =>
        [containerName, storageLedgerEntriesInContainer.map(({ blobName }) => blobName)] as const,
    ),
  );
};
