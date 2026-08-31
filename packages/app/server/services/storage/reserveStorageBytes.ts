import type { StorageBlobReservation } from "@@/server/models/storage/StorageBlobReservation";
import type { Context } from "@@/server/trpc/context";
import type { AzureContainer, User } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import {
  MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES,
  storageQuotaExceededErrorMessage,
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

  const declaredBytes = reservations.reduce((total, { declaredBytes: bytes }) => total + bytes, 0);
  const now = new Date();
  const expiresAt = dayjs(now).add(WRITE_SAS_DURATION_MS, "ms").toDate();
  // A row must outlive every `BlobCreated` that can still name it, or a retry of one whose blob did land finds
  // No row, charges nothing, and reports no failure. Storage checks a SAS when it receives the request, not when
  // It finishes, so the last PUT a write SAS authorizes STARTS at `expiresAt` and its event is raised whenever
  // That upload completes; Event Grid then keeps retrying it for `EVENT_GRID_DELIVERY_TTL_MS`. The completion
  // Allowance is the SAS's own duration reused — a bound already in hand, and orders of magnitude beyond what a
  // `MAX_FILE_REQUEST_SIZE` PUT takes — so nothing new can drift from the policy. See /docs/platform/storage-quotas
  const collectableBefore = dayjs(now)
    .subtract(EVENT_GRID_DELIVERY_TTL_MS + WRITE_SAS_DURATION_MS, "ms")
    .toDate();
  await db.transaction(async (tx) => {
    // `storageLedger` before `users`, the order every path that touches both takes — a release and a reconcile
    // Lock the ledger row first and move the counter second, so a reserve that took the user row first would
    // Close a lock cycle with them and deadlock. See /docs/platform/storage-quotas
    //
    // The collectable holds are dropped, so the ledger stays bounded without anything sweeping it. They never
    // Entered the counter, so removing them moves nothing — it is pure garbage collection, and it rides the one
    // Write path this user already makes
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
    // Read behind that lock, so a concurrent reserve cannot see the same outstanding set and pass on it.
    // Expiry is what stops a hold counting, not the collection above — a row is kept past `expiresAt` only so a
    // Late `BlobCreated` can still find it, and a dead write target must never hold space or a slot in the
    // Meantime
    const [outstanding] = await tx
      .select({ pendingBytes: sum(storageLedger.declaredBytes), value: count() })
      .from(storageLedger)
      .where(
        and(eq(storageLedger.userId, userId), isNull(storageLedger.reconciledAt), gt(storageLedger.expiresAt, now)),
      );
    // `sum` is a bigint aggregate, so postgres hands it back as a string — and as null for an empty set
    const pendingBytes = Number(outstanding?.pendingBytes ?? 0);
    if (user.storageBytesUsed + pendingBytes + declaredBytes > StorageTierQuotaMap[user.storageTier])
      throw getForbiddenError(storageQuotaExceededErrorMessage);
    else if ((outstanding?.value ?? 0) + reservations.length > MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES)
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
