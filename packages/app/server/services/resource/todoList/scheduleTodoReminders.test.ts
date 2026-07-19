import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { dayjs } from "#shared/services/dayjs";
import { scheduleTodoReminders } from "@@/server/services/resource/todoList/scheduleTodoReminders";
import { AzureQueue } from "@esposter/db-schema";
import { MockServiceBusDatabase } from "azure-mock";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(
  import("@@/server/composables/azure/serviceBus/useServiceBusSender"),
  () => import("@@/server/composables/azure/serviceBus/useServiceBusSender.test"),
);

describe(scheduleTodoReminders, () => {
  const resourceId = crypto.randomUUID();
  const futureDueAt = new Date(Date.now() + dayjs.duration(1, "hour").asMilliseconds());
  const pastDueAt = new Date(Date.now() - dayjs.duration(1, "hour").asMilliseconds());

  afterEach(() => {
    MockServiceBusDatabase.clear();
  });

  test("enqueues a reminder for a new future due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: futureDueAt, name: "task" });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toStrictEqual([
      { body: { dueAt: futureDueAt, itemId: item.id, resourceId }, scheduledEnqueueTimeUtc: futureDueAt },
    ]);
  });

  test("skips a past due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: pastDueAt, name: "task" });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toBeUndefined();
  });

  test("skips an item without a due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ name: "task" });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toBeUndefined();
  });

  test("skips a due date unchanged since the previous save", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: futureDueAt, name: "task" });
    await scheduleTodoReminders(resourceId, { items: [item] }, { items: [item] });

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toBeUndefined();
  });

  test("enqueues a re-dated due date", async () => {
    expect.hasAssertions();

    const laterDueAt = new Date(Date.now() + dayjs.duration(2, "hours").asMilliseconds());
    const previousItem = new TodoListItem({ dueAt: futureDueAt, name: "task" });
    const item = new TodoListItem({ dueAt: laterDueAt, id: previousItem.id, name: "task" });
    await scheduleTodoReminders(resourceId, { items: [item] }, { items: [previousItem] });

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toStrictEqual([
      { body: { dueAt: laterDueAt, itemId: item.id, resourceId }, scheduledEnqueueTimeUtc: laterDueAt },
    ]);
  });
});
