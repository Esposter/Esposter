import type { StorageBlobReservation } from "#server/models/storage/StorageBlobReservation";
import type { Context } from "#server/trpc/context";
import type { StorageBucket, UserInAuth } from "@esposter/db-schema";

import { getForbiddenError } from "#server/trpc/guards/getForbiddenError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import {
  MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES,
  STORAGE_QUOTA_EXCEEDED_ERROR_MESSAGE,
} from "#shared/services/storage/constants";
import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import {
  DatabaseEntityType,
  QUEUE_DELIVERY_TTL_MS,
  storageLedgerInStorage,
  usersInAuth,
  WRITE_SAS_DURATION_MS,
} from "@esposter/db-schema";
import { notInJsonArray } from "@esposter/db";
import { TRPCError } from "@trpc/server";
import { and, eq, gt, isNull, lte, ne, or, sql } from "drizzle-orm";

// The gate every upload SAS passes through. A read-then-check would let a client firing many upload requests at once
// have them all read the same low usage and all pass. So the check is the insert's own guard: one statement inserts
// every reservation from the user's row only while the quota and the outstanding-reservation cap still hold over the
// holds other than these, and the batch is atomic, so a refused reserve leaves no hold behind. The counter itself only
// ever carries bytes that are actually stored, and a hold that has not landed yet lives in the ledger and is summed in
// here (openspec/specs/resource/storage-quotas/design.md)
export const reserveStorageBytes = async (
  db: Context["db"],
  userId: UserInAuth["id"],
  containerName: StorageBucket,
  reservations: StorageBlobReservation[],
): Promise<void> => {
  if (reservations.length === 0) return;

  const declaredBytes = reservations.reduce((total, { declaredBytes: bytes }) => total + bytes, 0);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + WRITE_SAS_DURATION_MS);
  // A row must outlive every `BlobCreated` that can still name it, or a retry of one whose blob did land finds
  // No row, charges nothing and reports no failure. The completion allowance is the SAS's own duration reused, so
  // Nothing new can drift from the policy (openspec/specs/resource/storage-quotas/design.md)
  const collectableBefore = new Date(now.getTime() - (QUEUE_DELIVERY_TTL_MS + WRITE_SAS_DURATION_MS));
  // The reservations travel as one JSON bind, so the statement's parameters do not grow with the number of blobs
  const reservationsJson = JSON.stringify(
    reservations.map(({ blobName, declaredBytes: bytes }) => ({ blobName, declaredBytes: bytes })),
  );
  // A hold this batch takes over is replaced rather than joined, so it is left out of the sum rather than counted twice
  const blobNames = reservations.map(({ blobName }) => blobName);
  const pendingWhere = and(
    eq(storageLedgerInStorage.userId, userId),
    isNull(storageLedgerInStorage.reconciledAt),
    gt(storageLedgerInStorage.expiresAt, now),
    or(ne(storageLedgerInStorage.containerName, containerName), notInJsonArray(storageLedgerInStorage.blobName, blobNames)),
  );
  const pendingBytes = sql`(SELECT COALESCE(SUM(${storageLedgerInStorage.declaredBytes}), 0) FROM ${storageLedgerInStorage} WHERE ${pendingWhere})`;
  const pendingReservationCount = sql`(SELECT COUNT(*) FROM ${storageLedgerInStorage} WHERE ${pendingWhere})`;
  // The quota is per tier, read off the user's row in the same statement, so the tier cannot change under the check
  const quotaBytes = sql`CASE ${usersInAuth.storageTier} ${sql.join(
    Object.entries(StorageTierQuotaMap).map(([storageTier, quota]) => sql`WHEN ${storageTier} THEN ${quota}`),
    sql` `,
  )} END`;
  const isWithinQuota = sql`${usersInAuth.id} = ${userId} AND ${usersInAuth.storageBytesUsed} + ${pendingBytes} + ${declaredBytes} <= ${quotaBytes} AND ${pendingReservationCount} + ${reservations.length} <= ${MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES}`;
  // The collectable holds are dropped first, as the write path always did, and their drop stands even when the reserve is
  // refused: they are holds no event can still settle, so there is nothing to give back by undoing it
  const [, reservedRows] = await db.batch([
    db
      .delete(storageLedgerInStorage)
      .where(
        and(
          eq(storageLedgerInStorage.userId, userId),
          isNull(storageLedgerInStorage.reconciledAt),
          eq(storageLedgerInStorage.countedBytes, 0),
          lte(storageLedgerInStorage.expiresAt, collectableBefore),
        ),
      ),
    db
      .insert(storageLedgerInStorage)
      .select(
        db
          .select({
            blobName: sql<string>`json_extract(reservation.value, '$.blobName')`,
            containerName: sql<StorageBucket>`${containerName}`,
            // Nothing is counted against the user until storage reports what actually landed. Until then the
            // Row's own `declaredBytes` is what holds the space, through the pending sum above
            countedBytes: sql<number>`0`,
            // Epoch milliseconds, the encoding the timestamp columns store, since an insert from a select is not encoded
            createdAt: sql<Date>`${now.getTime()}`,
            declaredBytes: sql<number>`json_extract(reservation.value, '$.declaredBytes')`,
            expiresAt: sql<Date>`${expiresAt.getTime()}`,
            reconciledAt: sql<Date | null>`NULL`,
            sequencer: sql<string | null>`NULL`,
            updatedAt: sql<Date>`${now.getTime()}`,
            userId: sql<string>`${userId}`,
          })
          .from(sql`json_each(${reservationsJson}) AS reservation, ${usersInAuth}`)
          .where(isWithinQuota),
      )
      // A name written again — a resource's staging blob is one fixed name — takes its row over as a fresh hold.
      // `countedBytes` stays: it is what the counter still carries for the blob on that name, so the next
      // `BlobCreated` corrects the counter by the difference and a release hands back what the row holds
      .onConflictDoUpdate({
        set: {
          declaredBytes: sql`excluded.${sql.identifier(storageLedgerInStorage.declaredBytes.name)}`,
          expiresAt: sql`excluded.${sql.identifier(storageLedgerInStorage.expiresAt.name)}`,
          reconciledAt: null,
        },
        target: [storageLedgerInStorage.containerName, storageLedgerInStorage.blobName],
      })
      .returning({ blobName: storageLedgerInStorage.blobName }),
  ]);
  if (reservedRows.length === reservations.length) return;

  // The guard refused, and says nothing of why. Read back the same figures to name the refusal
  const [user] = await db
    .select({ storageBytesUsed: usersInAuth.storageBytesUsed, storageTier: usersInAuth.storageTier })
    .from(usersInAuth)
    .where(eq(usersInAuth.id, userId));
  if (!user) throw getNotFoundError(DatabaseEntityType.User, userId);
  const [pendingTotals] = await db
    .select({ pendingBytes: sql<number>`COALESCE(SUM(${storageLedgerInStorage.declaredBytes}), 0)` })
    .from(storageLedgerInStorage)
    .where(pendingWhere);
  const pendingTotal = Number(pendingTotals?.pendingBytes ?? 0);
  if (user.storageBytesUsed + pendingTotal + declaredBytes > StorageTierQuotaMap[user.storageTier])
    throw getForbiddenError(STORAGE_QUOTA_EXCEEDED_ERROR_MESSAGE);
  throw new TRPCError({
    code: "TOO_MANY_REQUESTS",
    message: "Too many uploads are still in flight — wait for them to finish.",
  });
};
