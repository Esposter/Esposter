// A TodoList item's reminder as the person's object holds it: the item, its resource and the due date it was set for,
// Which the alarm re-verifies against the live content before it sends
export interface TodoReminder {
  dueAt: Date;
  itemId: string;
  resourceId: string;
}
