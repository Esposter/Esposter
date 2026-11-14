import type { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";

import { createR2Client } from "#src/services/cutover/cloudflare/r2/createR2Client";
import { createCoreExecutor } from "#src/services/cutover/cloudflare/d1/createCoreExecutor";
import { getCloudflareEnvironment } from "#src/services/cutover/getCloudflareEnvironment";
import { getCutoverArchiveBucketName } from "#src/services/cutover/getCutoverArchiveBucketName";
import { loadIdMap } from "#src/services/cutover/ids/loadIdMap";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { readPendingScheduledJobs } from "#src/services/cutover/postgres/readPendingScheduledJobs";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { requireEnvironmentVariable } from "#src/services/cutover/requireEnvironmentVariable";
import { callReschedule } from "#src/services/cutover/reschedule/callReschedule";
import { toRescheduleReminders } from "#src/services/cutover/reschedule/toRescheduleReminders";
import { readTableParents } from "#src/services/cutover/tables/readTableParents";

// Arms, inside the freeze, the old estate's pending message reminders and the TodoList reminders from the copied rows, on
// Their owners' objects, through the functions Worker's temporary route
export const runReschedule = async (environment: CutoverEnvironment): Promise<void> => {
  const variables = readCutoverEnvironment();
  const source = createSourceClient(variables.SOURCE_DATABASE_URL);
  const jobs = await readPendingScheduledJobs(source);
  await source.end();
  const idMap = await loadIdMap(createR2Client(), getCutoverArchiveBucketName(environment));
  const parents = await readTableParents(createCoreExecutor(getCloudflareEnvironment(environment), variables));
  const { scheduledReminders, scheduledTodoReminders } = await callReschedule(
    requireEnvironmentVariable("CUTOVER_FUNCTIONS_URL"),
    requireEnvironmentVariable("CUTOVER_SECRET"),
    { reminders: toRescheduleReminders(jobs, idMap, parents) },
  );
  console.info(
    `${scheduledReminders} message reminders and ${scheduledTodoReminders} TodoList reminders are armed on their owners' objects`,
  );
};
