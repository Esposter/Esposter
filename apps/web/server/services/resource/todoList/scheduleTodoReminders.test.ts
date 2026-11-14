import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import { scheduleTodoReminders } from "#server/services/resource/todoList/scheduleTodoReminders";
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(scheduleTodoReminders, () => {
  const resource = { id: v7(), userId: v7() };
  const name = "name";
  // The clock is pinned at the epoch, so the epoch itself is already past and the next hour is the future
  const futureDueAt = new Date(Temporal.Duration.from({ hours: 1 }).total("milliseconds"));
  const pastDueAt = new Date(0);

  const createReconcileCall = (reminders: { dueAt: Date; itemId: string }[], cancelledItemIds: string[] = []) => ({
    args: [
      {
        cancelledItemIds,
        reminders: reminders.map(({ dueAt, itemId }) => ({ dueAt, itemId, resourceId: resource.id })),
        resourceId: resource.id,
      },
    ],
    method: "reconcileTodoReminders",
    userId: resource.userId,
  });

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
    userObjectCalls.length = 0;
  });

  test("gives a reminder for a new future due date to the owner's object", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: futureDueAt, name });
    await scheduleTodoReminders(resource, { items: [item] }, undefined);

    expect(userObjectCalls).toStrictEqual([createReconcileCall([{ dueAt: futureDueAt, itemId: item.id }])]);
  });

  test("skips a past due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: pastDueAt, name });
    await scheduleTodoReminders(resource, { items: [item] }, undefined);

    expect(userObjectCalls).toHaveLength(0);
  });

  test("skips a completed item", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ completedAt: pastDueAt, dueAt: futureDueAt, name });
    await scheduleTodoReminders(resource, { items: [item] }, undefined);

    expect(userObjectCalls).toHaveLength(0);
  });

  test("skips an item without a due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ name });
    await scheduleTodoReminders(resource, { items: [item] }, undefined);

    expect(userObjectCalls).toHaveLength(0);
  });

  test("skips a due date unchanged since the previous save", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: futureDueAt, name });
    await scheduleTodoReminders(resource, { items: [item] }, { items: [item] });

    expect(userObjectCalls).toHaveLength(0);
  });

  test("gives a reopened item's due date, given while it was completed, a reminder", async () => {
    expect.hasAssertions();

    const previousItem = new TodoListItem({ completedAt: pastDueAt, dueAt: futureDueAt, name });
    const item = new TodoListItem({ dueAt: futureDueAt, id: previousItem.id, name });
    await scheduleTodoReminders(resource, { items: [item] }, { items: [previousItem] });

    expect(userObjectCalls).toStrictEqual([createReconcileCall([{ dueAt: futureDueAt, itemId: item.id }])]);
  });

  test("replaces a re-dated item's reminder rather than adding one", async () => {
    expect.hasAssertions();

    const laterDueAt = new Date(Temporal.Duration.from({ hours: 2 }).total("milliseconds"));
    const previousItem = new TodoListItem({ dueAt: futureDueAt, name });
    const item = new TodoListItem({ dueAt: laterDueAt, id: previousItem.id, name });
    await scheduleTodoReminders(resource, { items: [item] }, { items: [previousItem] });

    expect(userObjectCalls).toStrictEqual([createReconcileCall([{ dueAt: laterDueAt, itemId: item.id }])]);
  });

  test("cancels the reminder of an item whose due date is cleared", async () => {
    expect.hasAssertions();

    const previousItem = new TodoListItem({ dueAt: futureDueAt, name });
    const item = new TodoListItem({ id: previousItem.id, name });
    await scheduleTodoReminders(resource, { items: [item] }, { items: [previousItem] });

    expect(userObjectCalls).toStrictEqual([createReconcileCall([], [item.id])]);
  });
});
