// @vitest-environment nuxt
import { createScheduledMessageJob } from "@/services/message/draftsAndSent/createScheduledMessageJob.test";
import { createRoom } from "@/services/message/room/createRoom.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useScheduledMessageJobStore, () => {
  const server = setupMswTrpc();
  const id = crypto.randomUUID();
  const otherId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const room = createRoom("name");
  const createJob = (jobId: string) => createScheduledMessageJob({ id: jobId, room, userId });

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("drops a cancelled job from the loaded page", () => {
    expect.hasAssertions();

    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
    const { deleteScheduledMessageJob } = scheduledMessageJobStore;
    items.value = [createJob(id), createJob(otherId)];
    scheduledMessageJobCount.value = 2;
    deleteScheduledMessageJob(id);

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([otherId]);
    expect(scheduledMessageJobCount.value).toBe(1);
  });

  // The badge counts every scheduled job the user has, not just the page on screen, so a cancel of a job this
  // Page never held must leave it alone — decremented anyway, the tab reads one job short of the truth
  test("leaves the badge count alone for a job the page never held", () => {
    expect.hasAssertions();

    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
    const { deleteScheduledMessageJob } = scheduledMessageJobStore;
    items.value = [createJob(id)];
    scheduledMessageJobCount.value = 2;
    deleteScheduledMessageJob(otherId);

    expect(items.value).toHaveLength(1);
    expect(scheduledMessageJobCount.value).toBe(2);
  });

  // Each job is its own target, so two cancels overlap on one page and the failing one must put back only its
  // Own row — a job counted back into the badge has nothing to reconcile it until the page is read again
  test("puts back only the job whose cancel was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(({ input }) => {
        if (input.id === id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return createJob(input.id);
      }),
    );
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
    const { cancelScheduledMessageJob } = scheduledMessageJobStore;
    items.value = [createJob(id), createJob(otherId)];
    scheduledMessageJobCount.value = 2;
    await Promise.all([cancelScheduledMessageJob(id), cancelScheduledMessageJob(otherId)]);

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([id]);
    expect(scheduledMessageJobCount.value).toBe(1);
  });

  // Cancelling and sending one job are two writes to the same row, so they run one after the other and the
  // Second builds on what the first left. Racing on an executor each, the rejected cancel put its row back after
  // The send beside it had already found the row gone — leaving a job on the page the server had just sent
  test("does not leave a sent job on the page when the cancel beside it is rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
      trpcMsw.message.scheduledMessageJob.sendScheduledMessageNow.mutation(() =>
        createMessageEntity({ roomId: room.id, type: MessageType.Message, userId }),
      ),
    );
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
    const { cancelScheduledMessageJob, sendScheduledMessageNow } = scheduledMessageJobStore;
    items.value = [createJob(id), createJob(otherId)];
    scheduledMessageJobCount.value = 2;
    await Promise.all([cancelScheduledMessageJob(id), sendScheduledMessageNow(id)]);

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([otherId]);
    expect(scheduledMessageJobCount.value).toBe(1);
  });
});
