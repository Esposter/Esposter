import type { ScheduledJob } from "@esposter/db-schema";

import { describe, vi } from "vitest";

// Each Scheduler object's job and alarm time, by object id, as the Durable Object holds them
export const { scheduledJobMap } = vi.hoisted(() => ({
  scheduledJobMap: new Map<string, { job: ScheduledJob; runAt: number }>(),
}));

export const useScheduler = (id: string) => ({
  cancel: () => {
    scheduledJobMap.delete(id);
    return Promise.resolve();
  },
  schedule: (runAt: number, job: ScheduledJob) => {
    scheduledJobMap.set(id, { job, runAt });
    return Promise.resolve();
  },
});

describe.todo("useScheduler");
