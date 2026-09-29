import type { Recurrence } from "#shared/models/resource/todoList/Recurrence";
import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

import { getNextDueAt } from "#shared/services/resource/todoList/getNextDueAt";

// A repeating todo is never completed: ticking it moves it from the due date it has to its next one in the time zone
// Given, with its steps unticked, as Microsoft To Do and Todoist do
export const rollRecurringItem = (
  item: Pick<TodoListItem, "dueAt" | "steps">,
  dueAt: Date,
  recurrence: Recurrence,
  timeZone: string,
) => {
  item.dueAt = getNextDueAt(dueAt, recurrence, timeZone);
  if (item.steps) item.steps = item.steps.map(({ id, name }) => ({ id, name }));
};
