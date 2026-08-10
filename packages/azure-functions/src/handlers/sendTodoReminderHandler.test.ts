import type { Database } from "@esposter/db-schema";

import { sendTodoReminderHandler } from "@/handlers/sendTodoReminderHandler";
import { InvocationContext } from "@azure/functions";
import { dayjs, getContentBlobName } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, resources, ResourceType, users } from "@esposter/db-schema";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

const { sendTodoReminderNotificationMock } = vi.hoisted(() => ({
  sendTodoReminderNotificationMock:
    vi.fn<
      (context: InvocationContext, input: { itemName: string; resourceId: string; userId: string }) => Promise<void>
    >(),
}));

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("@/services/getContainerClient"), () => import("@/services/getContainerClient.test"));
vi.mock(import("@/services/sendTodoReminderNotification"), () => ({
  sendTodoReminderNotification: sendTodoReminderNotificationMock,
}));

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
  const dueAt = dayjs().add(1, "hour").toDate();

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

    expect(sendTodoReminderNotificationMock).toHaveBeenCalledWith(context, {
      itemName: name,
      resourceId: resource.id,
      userId,
    });
  });

  test("skips when the resource is gone", async () => {
    expect.hasAssertions();

    await sendTodoReminderHandler({ dueAt, itemId: crypto.randomUUID(), resourceId: crypto.randomUUID() }, context);

    expect(sendTodoReminderNotificationMock).not.toHaveBeenCalled();
  });

  test("skips when the item was deleted", async () => {
    expect.hasAssertions();

    const resource = await insertResource();
    await seedContent(resource.id, []);
    await sendTodoReminderHandler({ dueAt, itemId: crypto.randomUUID(), resourceId: resource.id }, context);

    expect(sendTodoReminderNotificationMock).not.toHaveBeenCalled();
  });

  test("skips when the item was re-dated", async () => {
    expect.hasAssertions();

    const resource = await insertResource();
    const itemId = crypto.randomUUID();
    const reDatedAt = dayjs(dueAt).add(1, "hour").toDate();
    await seedContent(resource.id, [{ dueAt: reDatedAt.toISOString(), id: itemId, name }]);
    await sendTodoReminderHandler({ dueAt, itemId, resourceId: resource.id }, context);

    expect(sendTodoReminderNotificationMock).not.toHaveBeenCalled();
  });
});
