import { callReschedule } from "#src/services/cutover/reschedule/callReschedule";
import { requireEnvironmentVariable } from "#src/services/cutover/requireEnvironmentVariable";

// Calls the functions Worker's temporary route, which schedules the pending jobs from the copied rows
export const runReschedule = async (): Promise<void> => {
  const scheduled = await callReschedule(
    requireEnvironmentVariable("CUTOVER_FUNCTIONS_URL"),
    requireEnvironmentVariable("CUTOVER_SECRET"),
  );
  console.info(`${scheduled} scheduled message jobs are scheduled on the Scheduler objects`);
};
