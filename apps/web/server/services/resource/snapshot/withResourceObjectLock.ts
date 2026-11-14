import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import {
  RESOURCE_OBJECT_LEASE_MS,
  RESOURCE_OBJECT_LOCK_RETRY_MS,
  RESOURCE_OBJECT_LOCK_WAIT_MS,
} from "#server/services/resource/constants";
import { DatabaseEntityType, resourceObjectLocksInResource } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, noop, Operation, sleep } from "@esposter/shared";
import { and, eq, lt } from "drizzle-orm";

// Takes the lease that one request holds over a resource's stored objects while it writes or collects them. The lease is
// a row, replaced only once it has expired, so a holder that never releases frees the resource when its lease runs out.
// The release names the holder, so a request never releases a lease that expired and was taken over by another
export const tryAcquireResourceObjectLock = async (
  db: Context["db"],
  resourceId: ResourceInResource["id"],
  holder: string,
): Promise<boolean> => {
  const now = Date.now();
  const [lease] = await db
    .insert(resourceObjectLocksInResource)
    .values({ expiresAt: new Date(now + RESOURCE_OBJECT_LEASE_MS), holder, resourceId })
    .onConflictDoUpdate({
      set: { expiresAt: new Date(now + RESOURCE_OBJECT_LEASE_MS), holder, updatedAt: new Date(now) },
      setWhere: lt(resourceObjectLocksInResource.expiresAt, new Date(now)),
      target: resourceObjectLocksInResource.resourceId,
    })
    .returning({ holder: resourceObjectLocksInResource.holder });
  return lease?.holder === holder;
};

export const releaseResourceObjectLock = async (
  db: Context["db"],
  resourceId: ResourceInResource["id"],
  holder: string,
): Promise<void> => {
  await db
    .delete(resourceObjectLocksInResource)
    .where(
      and(eq(resourceObjectLocksInResource.resourceId, resourceId), eq(resourceObjectLocksInResource.holder, holder)),
    );
};

// Runs `run` holding the resource's lease. A holder is waited for up to a bounded time, then the request is refused, so a
// save never queues behind a holder for longer than a user will wait. The lease is released whatever `run` does, and a
// release that fails is left to expire rather than failing the write it guarded
export const withResourceObjectLock = async <T>(
  db: Context["db"],
  resourceId: ResourceInResource["id"],
  run: () => Promise<T>,
): Promise<T> => {
  const holder = crypto.randomUUID();
  const deadline = Date.now() + RESOURCE_OBJECT_LOCK_WAIT_MS;
  // oxlint-disable-next-line no-await-in-loop -- each attempt waits on the one before it, for the same lease
  while (!(await tryAcquireResourceObjectLock(db, resourceId, holder))) {
    if (Date.now() >= deadline)
      throw new InvalidOperationError(
        Operation.Update,
        DatabaseEntityType.Resource,
        "is being written by another request",
      );
    await sleep(RESOURCE_OBJECT_LOCK_RETRY_MS);
  }
  const outcome = await getResultAsync(run);
  await getResultAsync(() => releaseResourceObjectLock(db, resourceId, holder)).match(noop, console.error);
  return outcome.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
