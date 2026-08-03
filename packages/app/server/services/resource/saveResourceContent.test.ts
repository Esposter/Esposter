import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Context } from "@@/server/trpc/context";
import type { Resource } from "@esposter/db-schema";

import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { resourceEventEmitter } from "@@/server/services/resource/events/resourceEventEmitter";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { saveResourceContent } from "@@/server/services/resource/saveResourceContent";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { AzureQueue, AzureTable, ResourceActivityType, resources, ResourceType } from "@esposter/db-schema";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockServiceBusDatabase, MockTableDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The one place a resource's content blob is written, so its whole tail — the save event, the activity entry
// And the type's registered after-save hook — is asserted here once. Every path that writes content (the
// Editor's save, blueprint deploy, duplicate, restore) keeps only a wiring test proving it comes through here.
// TodoList is the representative type: it is the one with a registered after-save hook
const readActivityTypes = () =>
  [...(MockTableDatabase.get(AzureTable.ResourceActivity)?.values() ?? [])].map(
    ({ activityType }) => activityType as ResourceActivityType,
  );

describe(saveResourceContent, () => {
  let mockContext: Context;
  let ctx: AuthedContext;
  let resource: Resource;
  const name = "name";
  // The clock is pinned at the epoch, so the smallest future instant is all a reminder needs to be scheduled
  const dueAt = new Date(1);
  const item = new TodoListItem({ dueAt, name });
  const content: TodoListResource = { items: [item] };
  const { contentSchema } = ResourceDefinitionMap[ResourceType.TodoList];
  const createReminder = (resourceId: Resource["id"]) => ({
    body: { dueAt, itemId: item.id, resourceId },
    scheduledEnqueueTimeUtc: dueAt,
  });

  beforeAll(async () => {
    mockContext = await createMockContext();
    ctx = { ...mockContext, getSessionPayload: getMockSession() };
  });

  beforeEach(async () => {
    vi.useFakeTimers({ now: 0 });
    resource = takeOne(
      await mockContext.db
        .insert(resources)
        .values({ name, type: ResourceType.TodoList, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );
  });

  afterEach(async () => {
    vi.useRealTimers();
    resourceEventEmitter.removeAllListeners("saveResourceContent");
    MockContainerDatabase.clear();
    MockServiceBusDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(resources);
  });

  test("writes the content, emits the save, records the activity and runs the after-save hook as one unit", async () => {
    expect.hasAssertions();

    let saveEvent: undefined | { content: unknown; contentVersion: Resource["contentVersion"]; id: Resource["id"] };
    resourceEventEmitter.on("saveResourceContent", ([data]) => {
      saveEvent = data;
    });
    const savedResource = await saveResourceContent(ctx, {
      activityType: ResourceActivityType.ContentSaved,
      content,
      resource,
      updateContentVersion: async (tx) =>
        takeOne(
          await tx
            .update(resources)
            .set({ contentVersion: resource.contentVersion + 1 })
            .where(eq(resources.id, resource.id))
            .returning(),
        ),
    });
    // The hook and the activity entry are fire-and-forget off the write, so drain them before asserting
    await waitForSynchronizedFunctions();
    const storedContent = await readResourceContent(contentSchema, resource.id);
    assert.exists(saveEvent);

    expect(savedResource.contentVersion).toBe(resource.contentVersion + 1);
    expect(storedContent).toStrictEqual(jsonDateParse(JSON.stringify(content)));
    expect(saveEvent.id).toBe(resource.id);
    // The event carries the version the update returned, so a subscriber's next save is not rejected as stale
    expect(saveEvent.contentVersion).toBe(savedResource.contentVersion);
    expect(saveEvent.content).toBe(content);
    expect(readActivityTypes()).toStrictEqual([ResourceActivityType.ContentSaved]);
    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toStrictEqual([createReminder(resource.id)]);
  });

  // The prior content is read before the write overwrites it, so a hook that diffs sees what it replaced —
  // Without it every write would look like a first write and re-fire everything the content declares
  test("runs the after-save hook against the content the write replaces", async () => {
    expect.hasAssertions();

    await saveResourceContent(ctx, { content, resource });
    await waitForSynchronizedFunctions();
    await saveResourceContent(ctx, { content, resource });
    await waitForSynchronizedFunctions();

    // The second write repeats an unchanged due date, so it schedules nothing on top of the first
    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toStrictEqual([createReminder(resource.id)]);
  });

  // The one step a caller may opt out of, and only where `createResourceRow` has already opened the trail
  test("records no activity without an activityType", async () => {
    expect.hasAssertions();

    await saveResourceContent(ctx, { content, resource });
    await waitForSynchronizedFunctions();

    expect(readActivityTypes()).toStrictEqual([]);
  });
});
