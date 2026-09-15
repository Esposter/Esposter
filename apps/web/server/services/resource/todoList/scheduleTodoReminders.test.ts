import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { scheduleTodoReminders } from "@@/server/services/resource/todoList/scheduleTodoReminders";
import { AzureQueue } from "@esposter/db-schema";
import { MockServiceBusDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(scheduleTodoReminders, () => {
  const resourceId = crypto.randomUUID();
  const name = "name";
  // The clock is pinned at the epoch, so the epoch itself is already past and the next hour is the future
  const futureDueAt = new Date(Temporal.Duration.from({ hours: 1 }).total("milliseconds"));
  const pastDueAt = new Date(0);

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
    MockServiceBusDatabase.clear();
  });

  test("enqueues a reminder for a new future due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: futureDueAt, name });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toStrictEqual([
      { body: { dueAt: futureDueAt, itemId: item.id, resourceId }, scheduledEnqueueTimeUtc: futureDueAt },
    ]);
  });

  test("skips a past due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: pastDueAt, name });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toBeUndefined();
  });

  test("skips an item without a due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ name });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toBeUndefined();
  });

  test("skips a due date unchanged since the previous save", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: futureDueAt, name });
    await scheduleTodoReminders(resourceId, { items: [item] }, { items: [item] });

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toBeUndefined();
  });

  test("enqueues a re-dated due date", async () => {
    expect.hasAssertions();

    const laterDueAt = new Date(Temporal.Duration.from({ hours: 2 }).total("milliseconds"));
    const previousItem = new TodoListItem({ dueAt: futureDueAt, name });
    const item = new TodoListItem({ dueAt: laterDueAt, id: previousItem.id, name });
    await scheduleTodoReminders(resourceId, { items: [item] }, { items: [previousItem] });

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toStrictEqual([
      { body: { dueAt: laterDueAt, itemId: item.id, resourceId }, scheduledEnqueueTimeUtc: laterDueAt },
    ]);
  });
});
