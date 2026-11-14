import type { TodoReminder } from "#src/models/todoReminder/TodoReminder";

// One save's reminders for one resource: the items whose due date is new or changed, and the items whose reminder no
// Longer stands and is removed
export interface ReconcileTodoRemindersInput {
  cancelledItemIds: string[];
  reminders: TodoReminder[];
  resourceId: string;
}
