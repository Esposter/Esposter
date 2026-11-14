import type { ScheduledJob, SchedulerObject } from "@esposter/db-schema";

import { SCHEDULED_JOB_STORAGE_KEY } from "#src/services/scheduler/constants";
import { DurableObject } from "cloudflare:workers";

// One object per job id, holding the one job it is for: a reschedule replaces the job and its alarm, and a cancel
// Removes both. Its alarm sends the job to the queue it names, so the due time is the alarm's and never a queue delay
export class Scheduler extends DurableObject<Cloudflare.Env> implements SchedulerObject {
  async alarm(): Promise<void> {
    const job = await this.ctx.storage.get<ScheduledJob>(SCHEDULED_JOB_STORAGE_KEY);
    if (!job) return;
    // Deleted only once the queue has it, so a send that fails leaves the job for the alarm's own retry
    await this.env[job.queueJob].send(job.payload);
    await this.ctx.storage.delete(SCHEDULED_JOB_STORAGE_KEY);
  }

  async cancel(): Promise<void> {
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.delete(SCHEDULED_JOB_STORAGE_KEY);
  }

  async schedule(runAt: number, job: ScheduledJob): Promise<void> {
    await this.ctx.storage.put(SCHEDULED_JOB_STORAGE_KEY, job);
    await this.ctx.storage.setAlarm(runAt);
  }
}
