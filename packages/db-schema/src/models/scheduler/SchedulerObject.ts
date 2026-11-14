import type { ScheduledJob } from "#src/models/scheduler/ScheduledJob";

// The RPC surface of a Scheduler object, the one contract its class in the functions Worker and both Workers' callers share
export interface SchedulerObject {
  cancel(): Promise<void>;
  schedule(runAt: number, job: ScheduledJob): Promise<void>;
}
