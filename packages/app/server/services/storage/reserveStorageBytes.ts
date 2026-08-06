import type { StorageBlobReservation } from "@@/server/models/storage/StorageBlobReservation";
import type { Context } from "@@/server/trpc/context";
import type { AzureContainer, User } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { MAX_UNRECONCILED_STORAGE_BLOBS, storageQuotaExceededErrorMessage } from "#shared/services/storage/constants";
import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import { DatabaseEntityType, storageBlobs, users, WRITE_SAS_DURATION_MS } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { and, count, eq, gt, isNull, lte, sum } from "drizzle-orm";

// The gate every upload SAS passes through. Read-then-check would not hold on its own: a client firing many
// Upload requests concurrently has them all read the same low usage, all pass, and all upload. So everything
// That decides — the outstanding holds, the decision, the new rows — happens behind the user row's lock, which
// Is what makes concurrent reserves serialize instead of racing.
//
// The counter itself only ever carries bytes that are actually stored; a hold that has not landed yet lives in
// The ledger and is summed in here. That is what makes an abandoned upload need no cleanup at all: past
// `expiresAt` its write SAS is dead, so the row simply stops counting. Nothing has to run to release it.
// Callers mint the SAS first and reserve after: signing is local and has no effect on Azure, so a rejection
// Here means the client never receives a write target.
export const reserveStorageBytes = async (
  db: Context["db"],
  userId: User["id"],
  containerName: AzureContainer,
  reservations: StorageBlobReservation[],
): Promise<void> => {
  if (reservations.length === 0) return;

  // A thumbnail rides on the file it belongs to: the client downscales it, so its size is declared nowhere and
  // Its hold is zero. Those riders claim no space and take no in-flight slot — a thumbnail the client never
  // Manages to generate would otherwise hold a slot until its write SAS expires, while the upload it belongs
  // To succeeded. Every reservation a caller declares bytes for is one upload. See /docs/platform/storage-quotas
  const declaredReservations = reservations.filter(({ declaredBytes: bytes }) => bytes > 0);
  const declaredBytes = declaredReservations.reduce((total, { declaredBytes: bytes }) => total + bytes, 0);
  const now = new Date();
  const expiresAt = dayjs(now).add(WRITE_SAS_DURATION_MS, "ms").toDate();
  await db.transaction(async (tx) => {
    // `storage_blobs` before `users`, the order every path that touches both takes — a release and a reconcile
    // Lock the ledger row first and move the counter second, so a reserve that took the user row first would
    // Close a lock cycle with them and deadlock. See /docs/platform/storage-quotas
    //
    // The expired holds are dropped rather than filtered, so the ledger stays bounded without anything
    // Sweeping it. They never entered the counter, so removing them moves nothing — it is pure garbage
    // Collection, and it rides the one write path this user already makes
    await tx
      .delete(storageBlobs)
      .where(and(eq(storageBlobs.userId, userId), isNull(storageBlobs.reconciledAt), lte(storageBlobs.expiresAt, now)));
    const [user] = await tx
      .select({ storageBytesUsed: users.storageBytesUsed, storageTier: users.storageTier })
      .from(users)
      .where(eq(users.id, userId))
      .for("update");
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: DatabaseEntityType.User });

    // Read behind that lock, so a concurrent reserve cannot see the same outstanding set and pass on it. The
    // Zero-declared riders are excluded here for the same reason they are excluded above — the sum is
    // Unaffected by them, the count is what they would distort
    const [outstanding] = await tx
      .select({ pendingBytes: sum(storageBlobs.declaredBytes), value: count() })
      .from(storageBlobs)
      .where(
        and(eq(storageBlobs.userId, userId), isNull(storageBlobs.reconciledAt), gt(storageBlobs.declaredBytes, 0)),
      );
    // `sum` is a bigint aggregate, so postgres hands it back as a string — and as null for an empty set
    const pendingBytes = Number(outstanding?.pendingBytes ?? 0);
    if (user.storageBytesUsed + pendingBytes + declaredBytes > StorageTierQuotaMap[user.storageTier])
      throw new TRPCError({ code: "FORBIDDEN", message: storageQuotaExceededErrorMessage });
    else if ((outstanding?.value ?? 0) + declaredReservations.length > MAX_UNRECONCILED_STORAGE_BLOBS)
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many uploads are still in flight — wait for them to finish.",
      });

    await tx.insert(storageBlobs).values(
      reservations.map(({ blobName, declaredBytes: bytes }) => ({
        blobName,
        containerName,
        // Nothing is counted against the user until storage reports what actually landed. Until then the
        // Row's own `declaredBytes` is what holds the space, through the pending sum above
        countedBytes: 0,
        declaredBytes: bytes,
        expiresAt,
        userId,
      })),
    );
  });
};
