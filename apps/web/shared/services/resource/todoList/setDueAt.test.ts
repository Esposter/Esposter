import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

import { RecurrenceUnit } from "#shared/models/resource/todoList/RecurrenceUnit";
import { getNextDueAt } from "#shared/services/resource/todoList/getNextDueAt";
import { setDueAt } from "#shared/services/resource/todoList/setDueAt";
import { assert, describe, expect, test } from "vitest";

describe(setDueAt, () => {
  const timeZone = "UTC";
  const toDate = (isoDate: string) =>
    new Date(Temporal.PlainDate.from(isoDate).toZonedDateTime(timeZone).epochMilliseconds);

  test("moves a monthly repeat's start with its due date, so ticking it lands a month after the move", () => {
    expect.hasAssertions();

    const movedDueAt = toDate("1970-03-17");
    const item: Pick<TodoListItem, "dueAt" | "recurrence"> = {
      dueAt: toDate("1970-03-03"),
      recurrence: { interval: 1, startsAt: toDate("1970-03-03"), unit: RecurrenceUnit.Month },
    };

    setDueAt(item, movedDueAt);

    assert.exists(item.recurrence);
    expect(getNextDueAt(movedDueAt, item.recurrence, timeZone)).toStrictEqual(toDate("1970-04-17"));
  });

  test("clearing the due date stops the repeat", () => {
    expect.hasAssertions();

    const item: Pick<TodoListItem, "dueAt" | "recurrence"> = {
      dueAt: toDate("1970-03-03"),
      recurrence: { interval: 1, startsAt: toDate("1970-03-03"), unit: RecurrenceUnit.Month },
    };

    setDueAt(item, undefined);

    expect(item).toStrictEqual({ dueAt: undefined, recurrence: undefined });
  });

  test("moves a todo that does not repeat without giving it a repeat", () => {
    expect.hasAssertions();

    const item: Pick<TodoListItem, "dueAt" | "recurrence"> = { dueAt: toDate("1970-03-03") };

    setDueAt(item, toDate("1970-03-17"));

    expect(item).toStrictEqual({ dueAt: toDate("1970-03-17") });
  });
});
