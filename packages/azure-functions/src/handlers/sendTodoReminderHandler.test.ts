import type { Database } from "@esposter/db-schema";

import { sendTodoReminderHandler } from "#src/handlers/sendTodoReminderHandler";
import { MOCK_EVENT_GRID_ENDPOINT } from "#src/services/eventGridPublisherClient.test";
import { InvocationContext } from "@azure/functions";
import { getContentBlobName } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { AppNotificationType, AzureContainer, resources, ResourceType, users } from "@esposter/db-schema";
import { MockContainerClient, MockContainerDatabase, MockEventGridDatabase } from "azure-mock";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/eventGridPublisherClient"), () => import("#src/services/eventGridPublisherClient.test"));
vi.mock(import("#src/services/getContainerClient"), () => import("#src/services/getContainerClient.test"));

const seedContent = (resourceId: string, items: { dueAt: string; id: string; name: string }[]) => {
  const containerClient = new MockContainerClient("", AzureContainer.ResourceAssets);
  const blockBlobClient = containerClient.getBlockBlobClient(getContentBlobName(resourceId));
  const content = JSON.stringify({ items });
  return blockBlobClient.upload(content, content.length);
};

describe(sendTodoReminderHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const name = "task";
  const userId = crypto.randomUUID();
  const dueAt = new Date(Date.now() + Temporal.Duration.from({ hours: 1 }).total("milliseconds"));

  const insertResource = async () => {
    const [resource] = await mockDb.insert(resources).values({ name, type: ResourceType.TodoList, userId }).returning();
    if (!resource) throw new Error("resource insert failed");
    return resource;
  };

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: userId, name });
  });

  afterEach(async () => {
    vi.clearAllMocks();
    MockContainerDatabase.clear();
    MockEventGridDatabase.clear();
    await mockDb.delete(resources);
  });

  afterAll(async () => {
    await mockDb.delete(users);
  });

  test("sends the reminder when the item still matches", async () => {
    expect.hasAssertions();

    const resource = await insertResource();
    const itemId = crypto.randomUUID();
    await seedContent(resource.id, [{ dueAt: dueAt.toISOString(), id: itemId, name }]);
    await sendTodoReminderHandler({ dueAt, itemId, resourceId: resource.id }, context);

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)?.map(({ data }) => data)).toStrictEqual([
      { itemName: name, resourceId: resource.id, type: AppNotificationType.TodoReminder, userId },
    ]);
  });

  test("skips when the resource is gone", async () => {
    expect.hasAssertions();

    await sendTodoReminderHandler({ dueAt, itemId: crypto.randomUUID(), resourceId: crypto.randomUUID() }, context);

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toBeUndefined();
  });

  test("skips when the item was deleted", async () => {
    expect.hasAssertions();

    const resource = await insertResource();
    await seedContent(resource.id, []);
    await sendTodoReminderHandler({ dueAt, itemId: crypto.randomUUID(), resourceId: resource.id }, context);

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toBeUndefined();
  });

  test("skips when the item was re-dated", async () => {
    expect.hasAssertions();

    const resource = await insertResource();
    const itemId = crypto.randomUUID();
    const reDatedAt = new Date(dueAt.getTime() + Temporal.Duration.from({ hours: 1 }).total("milliseconds"));
    await seedContent(resource.id, [{ dueAt: reDatedAt.toISOString(), id: itemId, name }]);
    await sendTodoReminderHandler({ dueAt, itemId, resourceId: resource.id }, context);

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toBeUndefined();
  });
});
