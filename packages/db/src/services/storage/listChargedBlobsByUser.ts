import type { Database, StorageBucket, UserInAuth } from "@esposter/db-schema";

// The exact list of blobs a user is charged for, read from the storage ledger rather than from a listing of names:
// The ledger holds one row per charged blob with its bucket and owner, so a sweep removes what it was charged for
// And nothing else. Grouped by bucket, so each bucket's blobs go out together.
export const listChargedBlobsByUser = async (
  db: Database,
  userId: UserInAuth["id"],
): Promise<Map<StorageBucket, string[]>> => {
  const storageLedgerEntries = await db.query.storageLedgerInStorage.findMany({
    columns: { blobName: true, storageBucket: true },
    where: { userId: { eq: userId } },
  });
  const storageBucketStorageLedgerEntriesMap = Map.groupBy(storageLedgerEntries, ({ storageBucket }) => storageBucket);
  return new Map(
    Array.from(
      storageBucketStorageLedgerEntriesMap,
      ([storageBucket, storageLedgerEntriesInBucket]) =>
        [storageBucket, storageLedgerEntriesInBucket.map(({ blobName }) => blobName)] as const,
    ),
  );
};
