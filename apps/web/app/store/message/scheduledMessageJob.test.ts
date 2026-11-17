// @vitest-environment nuxt
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { createScheduledMessageJob } from "#src/services/message/draftsAndSent/createScheduledMessageJob.test";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useScheduledMessageJobStore } from "#src/store/message/scheduledMessageJob";
import { MessageType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useScheduledMessageJobStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const id = v7();
  const otherId = v7();
  const userId = v7();
  const room = createRoom("name");
  const createJob = (jobId: string) => createScheduledMessageJob({ id: jobId, room });

  // The badge counts every job the user has, and this page holds only some of them, so a cancel is answered with the
  // Count the server now holds rather than the page's own count less the row the cancel removed
  test("takes the badge from the server once a cancel lands, since the page does not hold every job", async () => {
    expect.hasAssertions();

    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => undefined);
    trpcMsw.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query(() => 5);
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
    const { cancelScheduledMessageJob } = scheduledMessageJobStore;
    items.value = [createJob(id), createJob(otherId)];
    scheduledMessageJobCount.value = 2;
    cancelScheduledMessageJob(createJob(id));
    await flushPromises();

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([otherId]);
    expect(scheduledMessageJobCount.value).toBe(5);
  });

  // A rolled-back job goes back to the place it held, which is when it runs, then its id. Appending it would put a
  // Job that runs first behind the one that runs after it, on a page the server answers in that order
  test("puts a rolled-back job back where it runs, not at the end of the page", async () => {
    expect.hasAssertions();

    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items } = storeToRefs(scheduledMessageJobStore);
    const { cancelScheduledMessageJob } = scheduledMessageJobStore;
    const earlierJob = { ...createJob(id), runAt: new Date(1) };
    const laterJob = { ...createJob(otherId), runAt: new Date(2) };
    items.value = [earlierJob, laterJob];
    cancelScheduledMessageJob(earlierJob);
    await flushPromises();

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([id, otherId]);
  });

  // A read can answer while a cancel is in flight and already hold the job the cancel removes, so the rollback restores
  // Nothing the page holds rather than listing the job twice
  test("does not list a job twice when a read that landed during a rejected cancel already holds it", async () => {
    expect.hasAssertions();

    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items } = storeToRefs(scheduledMessageJobStore);
    const { cancelScheduledMessageJob, readItems } = scheduledMessageJobStore;
    const job = createJob(id);
    const laterJob = createJob(otherId);
    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(async () => {
      await readItems(() => Promise.resolve({ items: [job, laterJob], nextCursor: "" }));
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    items.value = [job, laterJob];
    cancelScheduledMessageJob(job);
    await flushPromises();

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([id, otherId]);
  });

  // Each job is its own target, so two cancels overlap on one page and the failing one must put back only its
  // Own row, while the badge is read from the server once the other one lands
  test("puts back only the job whose cancel was rejected", async () => {
    expect.hasAssertions();

    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(({ input }) => {
      if (input.id === id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query(() => 1);
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
    const { cancelScheduledMessageJob } = scheduledMessageJobStore;
    items.value = [createJob(id), createJob(otherId)];
    scheduledMessageJobCount.value = 2;
    cancelScheduledMessageJob(createJob(id));
    cancelScheduledMessageJob(createJob(otherId));
    await flushPromises();

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([id]);
    expect(scheduledMessageJobCount.value).toBe(1);
  });

  // Cancelling and sending one job are two writes to the same row, so they run one after the other and the
  // Second builds on what the first left. Racing on an executor each, the rejected cancel put its row back after
  // The send beside it had already found the row gone — leaving a job on the page the server had just sent
  test("does not leave a sent job on the page when the cancel beside it is rejected", async () => {
    expect.hasAssertions();

    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.message.scheduledMessage.sendScheduledMessageNow.mutation(() =>
      createOptimisticMessage({ roomId: room.id, type: MessageType.Message }, userId),
    );
    trpcMsw.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query(() => 1);
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
    const { cancelScheduledMessageJob, sendScheduledMessageNow } = scheduledMessageJobStore;
    items.value = [createJob(id), createJob(otherId)];
    scheduledMessageJobCount.value = 2;
    cancelScheduledMessageJob(createJob(id));
    sendScheduledMessageNow(createJob(id));
    await flushPromises();

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([otherId]);
    expect(scheduledMessageJobCount.value).toBe(1);
  });
});
