import type { StorageBlobReservation } from "@@/server/models/storage/StorageBlobReservation";
import type { Context } from "@@/server/trpc/context";
import type { AzureContainer, User } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { MAX_UNRECONCILED_STORAGE_BLOBS, storageQuotaExceededErrorMessage } from "#shared/services/storage/constants";
import { getStorageQuotaBytesSql } from "@@/server/services/storage/getStorageQuotaBytesSql";
import { storageBlobs, users, WRITE_SAS_DURATION_MS } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { and, count, eq, isNull, sql } from "drizzle-orm";

// The gate every upload SAS passes through. Read-then-check would not hold: a client firing many upload
// Requests concurrently has them all read the same low counter, all pass, and all upload — so the check is
// Part of the write instead. The conditional UPDATE is a compare-and-swap that concurrent requests serialize
// On the user row for, and the ledger rows are inserted in the same transaction, so bytes can never be held
// With nothing left to give them back. Callers mint the SAS first and reserve after: signing is local and has
// No effect on Azure, so a rejection here means the client never receives a write target.
export const reserveStorageBytes = async (
  db: Context["db"],
  userId: User["id"],
  containerName: AzureContainer,
  reservations: StorageBlobReservation[],
): Promise<void> => {
  if (reservations.length === 0) return;

  const declaredBytes = reservations.reduce((total, { declaredBytes: bytes }) => total + bytes, 0);
  const expiresAt = dayjs().add(WRITE_SAS_DURATION_MS, "ms").toDate();
  await db.transaction(async (tx) => {
    const reservedUsers = await tx
      .update(users)
      .set({ storageBytesUsed: sql`${users.storageBytesUsed} + ${declaredBytes}` })
      .where(
        and(eq(users.id, userId), sql`${users.storageBytesUsed} + ${declaredBytes} <= ${getStorageQuotaBytesSql()}`),
      )
      .returning({ id: users.id });
    if (reservedUsers.length === 0)
      throw new TRPCError({ code: "FORBIDDEN", message: storageQuotaExceededErrorMessage });

    // Counted after the UPDATE, never before: the UPDATE is what takes the row lock, so a concurrent reserve
    // Waits here and then reads a count that already includes the rows the winner committed. Checked before
    // The inserts so tripping it rolls the increment back with the transaction.
    const [outstanding] = await tx
      .select({ value: count() })
      .from(storageBlobs)
      .where(and(eq(storageBlobs.userId, userId), isNull(storageBlobs.reconciledAt)));
    if ((outstanding?.value ?? 0) + reservations.length > MAX_UNRECONCILED_STORAGE_BLOBS)
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many uploads are still in flight — wait for them to finish.",
      });

    await tx.insert(storageBlobs).values(
      reservations.map(({ blobName, declaredBytes: bytes }) => ({
        blobName,
        containerName,
        countedBytes: bytes,
        declaredBytes: bytes,
        expiresAt,
        userId,
      })),
    );
  });
};
