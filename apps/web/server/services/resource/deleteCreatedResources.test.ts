import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { R2Bucket } from "@cloudflare/workers-types";

import { useStreamTableClient } from "#server/composables/streams/useStreamTableClient";
import { deleteCreatedResources } from "#server/services/resource/deleteCreatedResources";
import { createEntity } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import {
  StorageBucket,
  StreamTable,
  getReverseTickedTimestamp,
  ResourceActivityEntity,
  ResourceActivityType,
} from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { bucketMock } = vi.hoisted(() => ({ bucketMock: {} as { current: R2Bucket } }));

vi.mock(import("#server/services/storage/getBucket"), () => ({ getBucket: () => bucketMock.current }));

// Only the row delete is asked of the database here, so the where clause it is handed is the whole contract
const createContext = () => {
  const where = vi.fn<() => Promise<void>>(() => Promise.resolve());
  return { ctx: { db: { delete: () => ({ where }) } } as unknown as AuthedContext, where };
};

const readActivityCount = async () => {
  const resourceActivityClient = useStreamTableClient(StreamTable.ResourceActivity);
  return (await resourceActivityClient.list()).length;
};

describe(deleteCreatedResources, () => {
  const resourceId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  let bucket: Awaited<ReturnType<typeof createMockBucket>>["bucket"];
  let dispose: () => Promise<void>;
  const createActivity = async () => {
    const resourceActivityClient = useStreamTableClient(StreamTable.ResourceActivity);
    await createEntity(
      resourceActivityClient,
      new ResourceActivityEntity({
        activityType: ResourceActivityType.Created,
        partitionKey: resourceId,
        rowKey: getReverseTickedTimestamp(),
        userId,
      }),
    );
  };

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ResourceAssets));
  });

  beforeEach(() => {
    bucketMock.current = bucket;
  });

  afterEach(() => {
    MockTableDatabase.clear();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await dispose();
  });

  // The trail is opened at insert time so no create path can forget it, which leaves the rollback holding an
  // Entry nothing can reach once the row it is read through is gone
  test("drops the created resource's activity trail with its row", async () => {
    expect.hasAssertions();

    await createActivity();
    const { ctx, where } = createContext();
    await deleteCreatedResources(ctx, [resourceId]);

    await expect(readActivityCount()).resolves.toBe(0);
    expect(where).toHaveBeenCalledTimes(1);
  });

  // The caller is already failing for its own reason, and a rollback that stops at its first failed step leaves
  // Behind the half-created resource it exists to remove
  test("deletes the row even when the blob cleanup fails", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(noop);
    bucketMock.current = {
      list: () => {
        throw new Error(" ");
      },
    } as unknown as R2Bucket;
    await createActivity();
    const { ctx, where } = createContext();
    await deleteCreatedResources(ctx, [resourceId]);

    await expect(readActivityCount()).resolves.toBe(0);
    expect(where).toHaveBeenCalledTimes(1);
  });

  test("asks for nothing when no resource was created", async () => {
    expect.hasAssertions();

    const { ctx, where } = createContext();
    await deleteCreatedResources(ctx, []);

    expect(where).not.toHaveBeenCalled();
  });
});
