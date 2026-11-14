import type { Database } from "@esposter/db-schema";

import { sendTodoReminder } from "#src/services/todoReminder/sendTodoReminder";
import { MockJobQueueDatabase } from "#src/services/queue/getJobQueue.test";
import { createUser } from "#src/services/shared/createUser.test";
import { getBucket } from "#src/services/storage/getBucket";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { getContentBlobName, writeJsonBlob } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  AppNotificationType,
  QueueJob,
  StorageBucket,
  resourcesInResource,
  ResourceType,
  usersInAuth,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/queue/getJobQueue"), () => import("#src/services/queue/getJobQueue.test"));

vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));

const seedContent = async (
  resourceId: string,
  items: { completedAt?: string; dueAt: string; id: string; name: string }[],
) => {
  const bucket = getBucket(StorageBucket.ResourceAssets);
  return writeJsonBlob(bucket, getContentBlobName(resourceId), JSON.stringify({ items }));
};

describe(sendTodoReminder, () => {
  const name = "name";
  const userId = crypto.randomUUID();
  const dueAt = new Date(0);

  const insertResource = async () =>
    takeOne(await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.TodoList, userId }).returning());

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([StorageBucket.ResourceAssets]);
    await mockDb.insert(usersInAuth).values(createUser(userId));
  });

  afterEach(async () => {
    await clearMockBuckets();
    MockJobQueueDatabase.clear();
    await mockDb.delete(resourcesInResource);
  });

  afterAll(async () => {
    await disposeMockBuckets();
    await mockDb.delete(usersInAuth);
  });

  test("sends the reminder when the item still matches", async () => {
    expect.hasAssertions();

    const resource = await insertResource();
    const itemId = crypto.randomUUID();
    await seedContent(resource.id, [{ dueAt: dueAt.toISOString(), id: itemId, name }]);
    await sendTodoReminder({ dueAt, itemId, resourceId: resource.id });

    expect(MockJobQueueDatabase.get(QueueJob.ProcessNotification)).toStrictEqual([
      { itemName: name, resourceId: resource.id, type: AppNotificationType.TodoReminder, userId },
    ]);
  });

  test("skips when the resource is gone", async () => {
    expect.hasAssertions();

    await sendTodoReminder({ dueAt, itemId: crypto.randomUUID(), resourceId: crypto.randomUUID() });

    expect(MockJobQueueDatabase.size).toBe(0);
  });

  test("skips when the item was deleted", async () => {
    expect.hasAssertions();

    const resource = await insertResource();
    await seedContent(resource.id, []);
    await sendTodoReminder({ dueAt, itemId: crypto.randomUUID(), resourceId: resource.id });

    expect(MockJobQueueDatabase.size).toBe(0);
  });

  test("skips when the item was re-dated", async () => {
    expect.hasAssertions();

    const resource = await insertResource();
    const itemId = crypto.randomUUID();
    const reDatedAt = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"));
    await seedContent(resource.id, [{ dueAt: reDatedAt.toISOString(), id: itemId, name }]);
    await sendTodoReminder({ dueAt, itemId, resourceId: resource.id });

    expect(MockJobQueueDatabase.size).toBe(0);
  });

  // Completing a todo cancels nothing already scheduled, so the reminder has to find out when it fires
  test("skips when the item was completed", async () => {
    expect.hasAssertions();

    const resource = await insertResource();
    const itemId = crypto.randomUUID();
    await seedContent(resource.id, [
      { completedAt: dueAt.toISOString(), dueAt: dueAt.toISOString(), id: itemId, name },
    ]);
    await sendTodoReminder({ dueAt, itemId, resourceId: resource.id });

    expect(MockJobQueueDatabase.size).toBe(0);
  });
});
