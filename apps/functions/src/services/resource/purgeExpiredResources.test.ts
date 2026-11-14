import type { Database } from "@esposter/db-schema";

import { purgeExpiredResources } from "#src/services/resource/purgeExpiredResources";
import { purgeResourceAndBroadcast } from "#src/services/resource/purgeResourceAndBroadcast";
import { createUser } from "#src/services/shared/createUser.test";
import { disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { createMockDb } from "@esposter/db-mock";
import {
  RECYCLE_BIN_RETENTION_MS,
  resourcesInResource,
  ResourceType,
  StorageBucket,
  usersInAuth,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));
vi.mock(import("#src/services/resource/purgeResourceAndBroadcast"), () => ({
  purgeResourceAndBroadcast: vi.fn<typeof purgeResourceAndBroadcast>(),
}));

describe(purgeExpiredResources, () => {
  const userId = v7();
  const name = "name";
  const expiredDeletedAt = new Date(Date.now() - RECYCLE_BIN_RETENTION_MS - 1000);
  const withinRetentionDeletedAt = new Date(Date.now() - RECYCLE_BIN_RETENTION_MS + 60_000);

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([StorageBucket.ResourceAssets]);
    await mockDb.insert(usersInAuth).values(createUser(userId));
  });

  afterEach(async () => {
    vi.mocked(purgeResourceAndBroadcast).mockReset();
    await mockDb.delete(resourcesInResource);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  const insertResource = async (deletedAt: Date | null) =>
    takeOne(
      await mockDb
        .insert(resourcesInResource)
        .values({ createdAt: new Date(0), deletedAt, name, type: ResourceType.Webpage, userId })
        .returning(),
    );

  test("purges only the rows whose retention has passed", async () => {
    expect.hasAssertions();

    const expiredResource = await insertResource(expiredDeletedAt);
    await insertResource(withinRetentionDeletedAt);
    await insertResource(null);

    await purgeExpiredResources();

    const purgedIds = vi.mocked(purgeResourceAndBroadcast).mock.calls.map((call) => call[1].id);
    expect(purgedIds).toStrictEqual([expiredResource.id]);
  });

  test("a resource that fails to purge is passed over, and the sweep carries on past it", async () => {
    expect.hasAssertions();

    const failingResource = await insertResource(expiredDeletedAt);
    const laterResource = await insertResource(expiredDeletedAt);
    vi.mocked(purgeResourceAndBroadcast).mockImplementation((_bucket, resource) =>
      resource.id === failingResource.id ? Promise.reject(new Error(" ")) : Promise.resolve(),
    );

    await expect(purgeExpiredResources()).resolves.toBeUndefined();
    const purgedIds = vi
      .mocked(purgeResourceAndBroadcast)
      .mock.calls.map((call) => call[1].id)
      .toSorted();
    expect(purgedIds).toStrictEqual([failingResource.id, laterResource.id].toSorted());
  });
});
