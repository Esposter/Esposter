import type { StorageBlobReservation } from "@@/server/models/storage/StorageBlobReservation";
import type { Context } from "@@/server/trpc/context";
import type { AzureContainer, User } from "@esposter/db-schema";

import {
  MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES,
  STORAGE_QUOTA_EXCEEDED_ERROR_MESSAGE,
} from "#shared/services/storage/constants";
import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import { getForbiddenError } from "@@/server/trpc/guards/getForbiddenError";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import {
  DatabaseEntityType,
  EVENT_GRID_DELIVERY_TTL_MS,
  storageLedger,
  users,
  WRITE_SAS_DURATION_MS,
} from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { and, count, eq, gt, isNull, lte, sum } from "drizzle-orm";

// The gate every upload SAS passes through. Read-then-check would not hold on its own: a client firing many
// Upload requests concurrently has them all read the same low usage, all pass, and all upload — so everything
// That decides happens behind the user row's lock. The counter itself only ever carries bytes that are actually
// Stored, and a hold that has not landed yet lives in the ledger and is summed in here
// (/docs/platform/storage-quotas)
export const reserveStorageBytes = async (
  db: Context["db"],
  userId: User["id"],
  containerName: AzureContainer,
  reservations: StorageBlobReservation[],
): Promise<void> => {
  if (reservations.length === 0) return;

  const declaredBytes = reservations.reduce((total, { declaredBytes: bytes }) => total + bytes, 0);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + WRITE_SAS_DURATION_MS);
  // A row must outlive every `BlobCreated` that can still name it, or a retry of one whose blob did land finds
  // No row, charges nothing and reports no failure. The completion allowance is the SAS's own duration reused, so
  // Nothing new can drift from the policy (/docs/platform/storage-quotas)
  const collectableBefore = new Date(now.getTime() - (EVENT_GRID_DELIVERY_TTL_MS + WRITE_SAS_DURATION_MS));
  await db.transaction(async (tx) => {
    // `storageLedger` before `users`, the order every path that touches both takes, so a reserve cannot close a
    // Lock cycle with a concurrent release or reconcile (/docs/platform/storage-quotas). The collectable holds
    // Ride this write path rather than a sweep of their own; they never entered the counter, so dropping them
    // Moves nothing
    await tx
      .delete(storageLedger)
      .where(
        and(
          eq(storageLedger.userId, userId),
          isNull(storageLedger.reconciledAt),
          lte(storageLedger.expiresAt, collectableBefore),
        ),
      );
    const [user] = await tx
      .select({ storageBytesUsed: users.storageBytesUsed, storageTier: users.storageTier })
      .from(users)
      .where(eq(users.id, userId))
      .for("update");
    if (!user) throw getNotFoundError(DatabaseEntityType.User, userId);
    // Read behind that lock, so a concurrent reserve cannot see the same outstanding set and pass on it. Expiry
    // Is what stops a hold counting, not the collection above — a row outlives `expiresAt` only so a late
    // `BlobCreated` can still find it
    const [pendingTotals] = await tx
      .select({ pendingBytes: sum(storageLedger.declaredBytes), pendingReservationCount: count() })
      .from(storageLedger)
      .where(
        and(eq(storageLedger.userId, userId), isNull(storageLedger.reconciledAt), gt(storageLedger.expiresAt, now)),
      );
    // `sum` is a bigint aggregate, so postgres hands it back as a string — and as null for an empty set
    const pendingBytes = Number(pendingTotals?.pendingBytes ?? 0);
    if (user.storageBytesUsed + pendingBytes + declaredBytes > StorageTierQuotaMap[user.storageTier])
      throw getForbiddenError(STORAGE_QUOTA_EXCEEDED_ERROR_MESSAGE);
    else if (
      (pendingTotals?.pendingReservationCount ?? 0) + reservations.length >
      MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES
    )
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many uploads are still in flight — wait for them to finish.",
      });

    await tx.insert(storageLedger).values(
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
