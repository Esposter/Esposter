import { requireEnvironmentVariable } from "#src/services/cutover/requireEnvironmentVariable";
import { callReschedule } from "#src/services/cutover/reschedule/callReschedule";

// Calls the functions Worker's temporary route, which arms the TodoList reminders from the copied rows on their owners' objects
export const runReschedule = async (): Promise<void> => {
  const { scheduledTodoReminders } = await callReschedule(
    requireEnvironmentVariable("CUTOVER_FUNCTIONS_URL"),
    requireEnvironmentVariable("CUTOVER_SECRET"),
  );
  console.info(`${scheduledTodoReminders} TodoList reminders are armed on their owners' objects`);
};
