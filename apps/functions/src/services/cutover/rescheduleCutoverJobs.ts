import type { SchedulerObject } from "@esposter/db-schema";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import { AzureFunction, scheduledMessageJobsInMessage } from "@esposter/db-schema";
import { and, isNull } from "drizzle-orm";

// Schedules a Scheduler object for every scheduled message job neither completed nor cancelled, the way the app schedules
// one when it is created. A job whose time passed while the estate was frozen is due now
export const rescheduleCutoverJobs = async (
  database: DrizzleD1Database,
  schedulerNamespace: DurableObjectNamespace<SchedulerObject>,
  now: number,
): Promise<number> => {
  const jobs = await database
    .select({ id: scheduledMessageJobsInMessage.id, runAt: scheduledMessageJobsInMessage.runAt })
    .from(scheduledMessageJobsInMessage)
    .where(
      and(isNull(scheduledMessageJobsInMessage.completedAt), isNull(scheduledMessageJobsInMessage.cancelledAt)),
    );
  await Promise.all(
    jobs.map(({ id, runAt }) =>
      schedulerNamespace.get(schedulerNamespace.idFromName(id)).schedule(Math.max(runAt.getTime(), now), {
        payload: { id },
        queueJob: AzureFunction.ProcessScheduledMessageJob,
      }),
    ),
  );
  return jobs.length;
};
