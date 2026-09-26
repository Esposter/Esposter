import type { Database } from "@esposter/db-schema";

import { sendTodoReminderHandler } from "#src/handlers/sendTodoReminderHandler";
import { MOCK_EVENT_GRID_ENDPOINT } from "#src/services/azure/constants.test";
import { getContainerClient } from "#src/services/azure/getContainerClient";
import { createUser } from "#src/services/shared/createUser.test";
import { InvocationContext } from "@azure/functions";
import { getContentBlobName, writeJsonBlob } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { AppNotificationType, AzureContainer, resources, ResourceType, users } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockEventGridDatabase } from "azure-mock";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(
  import("#src/services/azure/eventGridPublisherClient"),
  () => import("#src/services/azure/eventGridPublisherClient.test"),
);
vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));

const seedContent = async (resourceId: string, items: { dueAt: string; id: string; name: string }[]) => {
  const containerClient = await getContainerClient(AzureContainer.ResourceAssets);
  return writeJsonBlob(containerClient, getContentBlobName(resourceId), JSON.stringify({ items }));
};

describe(sendTodoReminderHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const name = "name";
  const userId = crypto.randomUUID();
  const dueAt = new Date(0);

  const insertResource = async () =>
    takeOne(await mockDb.insert(resources).values({ name, type: ResourceType.TodoList, userId }).returning());

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values(createUser(userId));
  });

  afterEach(async () => {
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
    const reDatedAt = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"));
    await seedContent(resource.id, [{ dueAt: reDatedAt.toISOString(), id: itemId, name }]);
    await sendTodoReminderHandler({ dueAt, itemId, resourceId: resource.id }, context);

    expect(MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT)).toBeUndefined();
  });
});
