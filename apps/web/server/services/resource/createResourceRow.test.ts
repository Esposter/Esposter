import type { AuthedContext } from "#server/models/auth/AuthedContext";

import { createResourceRow } from "#server/services/resource/createResourceRow";
import { resourceActivitiesInResource, resourcesInResource, ResourceType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(createResourceRow, () => {
  const name = "name";
  const resourceId = v7();
  const userId = v7();
  // The resource row resolves at once, and the activity entry settles only when the test releases it, so the one
  // Write the row waits on is the one the test holds
  const createContext = (activityWrite: Promise<void>, activityTables: unknown[]) =>
    ({
      db: {
        insert: (table: unknown) =>
          table === resourcesInResource
            ? { values: () => ({ returning: () => Promise.resolve([{ id: resourceId, name, userId }]) }) }
            : {
                select: () => {
                  activityTables.push(table);
                  return activityWrite;
                },
              },
        select: () => ({ from: () => ({}) }),
      },
      user: { id: userId },
    }) as unknown as AuthedContext;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The row is handed back only once its trail entry is durable, so the compensating cleanup a caller rolls back
  // Through cannot outrun the write — an entry landing after that cleanup deleted the row would resurrect itself
  // As an orphan, unreachable once the row gating the read is gone
  test("does not return the row until its activity entry is durable", async () => {
    expect.hasAssertions();

    const activityTables: unknown[] = [];
    const { promise: writePromise, resolve: releaseWrite } = Promise.withResolvers<void>();
    let isReturned = false;
    const promise = (async () => {
      const resource = await createResourceRow(createContext(writePromise, activityTables), {
        name,
        type: ResourceType.Sheet,
      });
      isReturned = true;
      return resource;
    })();
    // A timer boundary drains every pending microtask, so anything still unsettled is waiting on the gated write
    await vi.advanceTimersByTimeAsync(0);

    expect(activityTables).toStrictEqual([resourceActivitiesInResource]);
    expect(isReturned).toBe(false);

    releaseWrite();
    const resource = await promise;

    expect(resource.id).toBe(resourceId);
  });
});
