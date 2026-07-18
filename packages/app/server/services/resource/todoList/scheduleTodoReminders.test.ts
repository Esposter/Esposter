import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { scheduleTodoReminders } from "@@/server/services/resource/todoList/scheduleTodoReminders";
import { dayjs } from "@esposter/db";
import { afterEach, describe, expect, test, vi } from "vitest";

const scheduleMessagesMock = vi.fn();
vi.mock(import("@@/server/composables/azure/serviceBus/useServiceBusSender"), () => ({
  useServiceBusSender: () => ({ scheduleMessages: scheduleMessagesMock }),
}));

describe(scheduleTodoReminders, () => {
  const resourceId = crypto.randomUUID();
  const futureDueAt = new Date(Date.now() + dayjs.duration(1, "hour").asMilliseconds());
  const pastDueAt = new Date(Date.now() - dayjs.duration(1, "hour").asMilliseconds());

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("enqueues a reminder for a new future due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: futureDueAt, name: "task" });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(scheduleMessagesMock).toHaveBeenCalledWith(
      { body: { dueAt: futureDueAt, itemId: item.id, resourceId } },
      futureDueAt,
    );
  });

  test("skips a past due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: pastDueAt, name: "task" });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(scheduleMessagesMock).not.toHaveBeenCalled();
  });

  test("skips an item without a due date", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ name: "task" });
    await scheduleTodoReminders(resourceId, { items: [item] }, undefined);

    expect(scheduleMessagesMock).not.toHaveBeenCalled();
  });

  test("skips a due date unchanged since the previous save", async () => {
    expect.hasAssertions();

    const item = new TodoListItem({ dueAt: futureDueAt, name: "task" });
    await scheduleTodoReminders(resourceId, { items: [item] }, { items: [item] });

    expect(scheduleMessagesMock).not.toHaveBeenCalled();
  });

  test("enqueues a re-dated due date", async () => {
    expect.hasAssertions();

    const laterDueAt = new Date(Date.now() + dayjs.duration(2, "hours").asMilliseconds());
    const previousItem = new TodoListItem({ dueAt: futureDueAt, name: "task" });
    const item = new TodoListItem({ dueAt: laterDueAt, id: previousItem.id, name: "task" });
    await scheduleTodoReminders(resourceId, { items: [item] }, { items: [previousItem] });

    expect(scheduleMessagesMock).toHaveBeenCalledWith(
      { body: { dueAt: laterDueAt, itemId: item.id, resourceId } },
      laterDueAt,
    );
  });
});
