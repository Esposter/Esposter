import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

// Moving a todo's due date by hand, from its form or by dragging it on the calendar, is one change: a repeat counts from
// Its due date, so the move moves where it counts from too (`startsAt`). Clearing the date stops the repeat, since a repeat
// Without a due date has nothing to roll forward
export const setDueAt = (item: Pick<TodoListItem, "dueAt" | "recurrence">, dueAt: Date | undefined) => {
  item.dueAt = dueAt;
  if (!item.recurrence) return;

  item.recurrence = dueAt ? { ...item.recurrence, startsAt: dueAt } : undefined;
};
