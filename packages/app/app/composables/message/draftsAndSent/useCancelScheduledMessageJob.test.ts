// @vitest-environment nuxt
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { createRoom } from "@/store/message/room/index.test";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useCancelScheduledMessageJob, () => {
  const server = setupMswTrpc();
  const createdAt = new Date(0);
  const id = crypto.randomUUID();
  const otherId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const room = createRoom("name");
  const createScheduledMessageJob = (jobId: string): ScheduledMessageJobInMessageWithRoom => ({
    cancelledAt: null,
    completedAt: null,
    createdAt,
    deletedAt: null,
    id: jobId,
    payload: { message: "message", type: ScheduledMessageJobType.ScheduledMessage },
    processingStartedAt: null,
    room,
    roomId: room.id,
    runAt: createdAt,
    updatedAt: createdAt,
    userId,
  });

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Each job is its own target, so two cancels overlap on one page. The failing one must put back only its own
  // Row — reinstating the page as it stood resurrects the job the cancel beside it already took off, and counts
  // It in the badge, with nothing to reconcile either until the page is read again
  test("puts back only the job whose cancel was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.message.scheduledMessageJob.cancelScheduledJob.mutation(({ input }) => {
        if (input.id === id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return createScheduledMessageJob(input.id);
      }),
    );
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { count, items } = storeToRefs(scheduledMessageJobStore);
    const cancelScheduledMessageJob = useCancelScheduledMessageJob();
    items.value = [createScheduledMessageJob(id), createScheduledMessageJob(otherId)];
    count.value = 2;
    await Promise.all([cancelScheduledMessageJob(id), cancelScheduledMessageJob(otherId)]);

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([id]);
    expect(count.value).toBe(1);
  });
});
