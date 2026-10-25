import type { Recurrence } from "#shared/models/resource/todoList/Recurrence";
import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

// An open repeating todo with a due date rolls on when it is ticked, rather than completing. Shared by the checkbox and
// The agent's tick, so both take the same branch
export const checkRollsOnTick = <T extends Pick<TodoListItem, "completedAt" | "dueAt" | "recurrence">>(
  item: T,
): item is T & { dueAt: Date; recurrence: Recurrence } => Boolean(item.recurrence && item.dueAt && !item.completedAt);
