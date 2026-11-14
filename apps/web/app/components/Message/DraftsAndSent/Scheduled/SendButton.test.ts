// @vitest-environment nuxt
import MessageDraftsAndSentScheduledSendButton from "@/components/Message/DraftsAndSent/Scheduled/SendButton.vue";
import { createOptimisticMessage } from "@/services/message/createOptimisticMessage";
import { createScheduledMessageJob } from "@/services/message/draftsAndSent/createScheduledMessageJob.test";
import { createRoom } from "@/services/message/room/createRoom.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { MessageType, ScheduledMessageJobType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("messageDraftsAndSentScheduledSendButton", () => {
  const { trpcMsw } = setupMswTrpc();
  const userId = v7();
  const room = createRoom("name");
  const createJob = (message: string) =>
    createScheduledMessageJob({
      payload: { message, replyToId: null, type: ScheduledMessageJobType.ScheduledMessage },
      room,
    });

  // What the send owes the page — the optimistic removal and the rollback that races the cancel of the same job
  // — belongs to the store both surfaces write through, and is covered there. This is the wiring: the button
  // Sends the job it was handed and no other
  test("sends the job it is bound to", async () => {
    expect.hasAssertions();

    const { promise: isSent, resolve: onSent } = Promise.withResolvers<void>();
    trpcMsw.message.scheduledMessage.sendScheduledMessageNow.mutation(() => {
      onSent();
      return createOptimisticMessage({ roomId: room.id, type: MessageType.Message }, userId);
    });
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
    const sentScheduledMessageJob = createJob(v7());
    const otherScheduledMessageJob = createJob(v7());
    items.value = [sentScheduledMessageJob, otherScheduledMessageJob];
    scheduledMessageJobCount.value = 2;

    const component = await mountSuspended(MessageDraftsAndSentScheduledSendButton, {
      props: { scheduledMessageJob: sentScheduledMessageJob },
    });
    await component.get("button").trigger("click");
    await isSent;
    await flushPromises();

    expect(items.value.map(({ id }) => id)).toStrictEqual([otherScheduledMessageJob.id]);
    expect(scheduledMessageJobCount.value).toBe(1);
  });
});
