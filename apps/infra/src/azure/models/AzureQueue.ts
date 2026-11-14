// The live Service Bus queues. Frozen with the Azure estate, and deleted with the rest of `src/azure` at the cutover's
// Teardown
export enum AzureQueue {
  ScheduledMessageJobs = "scheduled-message-jobs",
  TodoReminders = "todo-reminders",
}
