// @vitest-environment nuxt
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";
import type { RoomInMessage } from "@esposter/db-schema";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { createMessageEntity, MessageType, MimeCategory, RoomType, ScheduledMessageJobType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useScheduledMessageJobStore, () => {
  const server = setupMswTrpc();
  const createdAt = new Date(0);
  const id = crypto.randomUUID();
  const otherId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const message = "message";
  const room: RoomInMessage = {
    allowedMimeCategories: [MimeCategory.Audio, MimeCategory.Document, MimeCategory.Image, MimeCategory.Video],
    categoryId: null,
    createdAt,
    deletedAt: null,
    id: crypto.randomUUID(),
    image: "",
    isReadOnly: false,
    maxFileSizeBytes: null,
    name: "name",
    participantKey: null,
    slowmodeMs: null,
    topic: "",
    type: RoomType.Room,
    updatedAt: createdAt,
    userId,
  };
  const createScheduledMessageJob = (jobId: string): ScheduledMessageJobInMessageWithRoom => ({
    cancelledAt: null,
    completedAt: null,
    createdAt,
    deletedAt: null,
    id: jobId,
    payload: { message, type: ScheduledMessageJobType.ScheduledMessage },
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

  test("drops a cancelled job from the loaded page", () => {
    expect.hasAssertions();

    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { count, items } = storeToRefs(scheduledMessageJobStore);
    const { removeScheduledMessageJob } = scheduledMessageJobStore;
    items.value = [createScheduledMessageJob(id), createScheduledMessageJob(otherId)];
    count.value = 2;
    removeScheduledMessageJob(id);

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([otherId]);
    expect(count.value).toBe(1);
  });

  // The badge counts every scheduled job the user has, not just the page on screen, so a cancel of a job this
  // Page never held must leave it alone — decremented anyway, the tab reads one job short of the truth
  test("leaves the badge count alone for a job the page never held", () => {
    expect.hasAssertions();

    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { count, items } = storeToRefs(scheduledMessageJobStore);
    const { removeScheduledMessageJob } = scheduledMessageJobStore;
    items.value = [createScheduledMessageJob(id)];
    count.value = 2;
    removeScheduledMessageJob(otherId);

    expect(items.value).toHaveLength(1);
    expect(count.value).toBe(2);
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
    const { cancelScheduledMessageJob } = scheduledMessageJobStore;
    items.value = [createScheduledMessageJob(id), createScheduledMessageJob(otherId)];
    count.value = 2;
    await Promise.all([cancelScheduledMessageJob(id), cancelScheduledMessageJob(otherId)]);

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([id]);
    expect(count.value).toBe(1);
  });

  // Cancelling and sending one job are two writes to the same row, so they run one after the other and the
  // Second builds on what the first left. Racing on an executor each, the rejected cancel put its row back after
  // The send beside it had already found the row gone — leaving a job on the page the server had just sent
  test("does not leave a sent job on the page when the cancel beside it is rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.message.scheduledMessageJob.cancelScheduledJob.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
      trpcMsw.message.scheduledMessageJob.sendScheduledMessageNow.mutation(() =>
        createMessageEntity({ roomId: room.id, type: MessageType.Message, userId }),
      ),
    );
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { count, items } = storeToRefs(scheduledMessageJobStore);
    const { cancelScheduledMessageJob, sendScheduledMessageNow } = scheduledMessageJobStore;
    items.value = [createScheduledMessageJob(id), createScheduledMessageJob(otherId)];
    count.value = 2;
    await Promise.all([cancelScheduledMessageJob(id), sendScheduledMessageNow(id)]);

    expect(items.value.map((scheduledMessageJob) => scheduledMessageJob.id)).toStrictEqual([otherId]);
    expect(count.value).toBe(1);
  });
});
