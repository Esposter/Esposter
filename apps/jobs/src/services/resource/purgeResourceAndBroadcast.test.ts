import type { Database } from "@esposter/db-schema";

import { getReaderWakes, MockPublishedTopics } from "#src/services/realtime/publishTopics.test";
import { purgeResourceAndBroadcast } from "#src/services/resource/purgeResourceAndBroadcast";
import { createUser } from "#src/services/shared/createUser.test";
import { runUnit } from "#src/services/shared/db";
import { getBucket } from "#src/services/storage/getBucket";
import { disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { createMockDb } from "@esposter/db-mock";
import { getScopeTopic, ResourceType, resourcesInResource, StorageBucket, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { and, eq, getTableName, isNotNull } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));

describe(purgeResourceAndBroadcast, () => {
  const userId = v7();

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([StorageBucket.ResourceAssets]);
    await mockDb.insert(usersInAuth).values(createUser(userId));
  });

  afterEach(async () => {
    MockPublishedTopics.length = 0;
    await mockDb.delete(resourcesInResource);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  // The recycle bin lists its owner's deleted resources, so the purge that deletes one of them wakes that list
  test("a purge wakes the owner's recycle bin, which lists the owner's deleted resources", async () => {
    expect.hasAssertions();

    const { id } = takeOne(
      await mockDb
        .insert(resourcesInResource)
        .values({ createdAt: new Date(0), deletedAt: new Date(0), name: "name", type: ResourceType.Webpage, userId })
        .returning(),
    );

    await runUnit(() => purgeResourceAndBroadcast(getBucket(StorageBucket.ResourceAssets), { id }));

    await expect(
      getReaderWakes(mockDb, (database) =>
        database
          .select()
          .from(resourcesInResource)
          .where(and(eq(resourcesInResource.userId, userId), isNotNull(resourcesInResource.deletedAt))),
      ),
    ).resolves.toContain(getScopeTopic(getTableName(resourcesInResource), "userId", userId));
  });
});
