import { callReschedule } from "#src/services/cutover/reschedule/callReschedule";
import { requireEnvironmentVariable } from "#src/services/cutover/requireEnvironmentVariable";

// Calls the functions Worker's temporary route, which schedules the pending jobs and TodoList reminders from the copied rows
export const runReschedule = async (): Promise<void> => {
  const { scheduledMessageJobs, scheduledTodoReminders } = await callReschedule(
    requireEnvironmentVariable("CUTOVER_FUNCTIONS_URL"),
    requireEnvironmentVariable("CUTOVER_SECRET"),
  );
  console.info(
    `${scheduledMessageJobs} scheduled message jobs and ${scheduledTodoReminders} TodoList reminders are scheduled on the Scheduler objects`,
  );
};
