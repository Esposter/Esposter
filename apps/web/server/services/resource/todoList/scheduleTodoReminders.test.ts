import { scheduledJobMap } from "#server/composables/scheduler/useScheduler";
import { scheduleTodoReminders } from "#server/services/resource/todoList/scheduleTodoReminders";
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { getTodoReminderId, QueueJob } from "@esposter/db-schema";
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
    scheduledJobMap.clear();
  });

  test("schedules a reminder for a new future due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: futureDueAt, name });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(scheduledJobMap.get(getTodoReminderId(resourceId, item.id))).toStrictEqual({
      job: {
        payload: { dueAt: futureDueAt, itemId: item.id, resourceId },
        queueJob: QueueJob.SendTodoReminder,
      },
      runAt: futureDueAt.getTime(),
    });
  });

  test("skips a past due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: pastDueAt, name });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(scheduledJobMap.size).toBe(0);
  });

  test("skips a completed item", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ completedAt: pastDueAt, dueAt: futureDueAt, name });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(scheduledJobMap.size).toBe(0);
  });

  test("skips an item without a due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ name });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(scheduledJobMap.size).toBe(0);
  });

  test("skips a due date unchanged since the previous save", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: futureDueAt, name });
    await scheduleTodoReminders(resourceId, { items: [item] }, { items: [item] });

    expect(scheduledJobMap.size).toBe(0);
  });

  test("schedules a reopened item's due date given while it was completed", async () => {
    expect.hasAssertions();

    const previousItem = new TodoListItem({ completedAt: pastDueAt, dueAt: futureDueAt, name });
    const item = new TodoListItem({ dueAt: futureDueAt, id: previousItem.id, name });
    await scheduleTodoReminders(resourceId, { items: [item] }, { items: [previousItem] });

    expect(scheduledJobMap.get(getTodoReminderId(resourceId, item.id))?.runAt).toBe(futureDueAt.getTime());
  });

  test("reschedules a re-dated item on its own object", async () => {
    expect.hasAssertions();

    const laterDueAt = new Date(Temporal.Duration.from({ hours: 2 }).total("milliseconds"));
    const previousItem = new TodoListItem({ dueAt: futureDueAt, name });
    const item = new TodoListItem({ dueAt: laterDueAt, id: previousItem.id, name });
    await scheduleTodoReminders(resourceId, { items: [previousItem] }, undefined);
    await scheduleTodoReminders(resourceId, { items: [item] }, { items: [previousItem] });

    expect([...scheduledJobMap.keys()]).toStrictEqual([getTodoReminderId(resourceId, item.id)]);
    expect(scheduledJobMap.get(getTodoReminderId(resourceId, item.id))?.runAt).toBe(laterDueAt.getTime());
  });

  test("clears the alarm of a reminder whose due date is cleared", async () => {
    expect.hasAssertions();

    const previousItem = new TodoListItem({ dueAt: futureDueAt, name });
    const item = new TodoListItem({ id: previousItem.id, name });
    await scheduleTodoReminders(resourceId, { items: [previousItem] }, undefined);
    await scheduleTodoReminders(resourceId, { items: [item] }, { items: [previousItem] });

    expect(scheduledJobMap.size).toBe(0);
  });
});
