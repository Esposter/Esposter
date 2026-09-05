// @vitest-environment nuxt
import MessageDraftsAndSentScheduledSendButton from "@/components/Message/DraftsAndSent/Scheduled/SendButton.vue";
import { createScheduledMessageJob } from "@/services/message/draftsAndSent/createScheduledMessageJob.test";
import { createRoom } from "@/services/message/room/createRoom.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { createMessageEntity, MessageType, ScheduledMessageJobType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageDraftsAndSentScheduledSendButton", () => {
  const server = setupMswTrpc();
  const userId = crypto.randomUUID();
  const room = createRoom("name");
  const createJob = (message: string) =>
    createScheduledMessageJob({
      payload: { message, replyRowKey: "", type: ScheduledMessageJobType.ScheduledMessage },
      room,
      userId,
    });

  // What the send owes the page — the optimistic removal and the rollback that races the cancel of the same job
  // — belongs to the store both surfaces write through, and is covered there. This is the wiring: the button
  // Sends the job it was handed and no other
  test("sends the job it is bound to", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.message.scheduledMessageJob.sendScheduledMessageNow.mutation(() =>
        createMessageEntity({ roomId: room.id, type: MessageType.Message, userId }),
      ),
    );
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
    const sentScheduledMessageJob = createJob("sent");
    const otherScheduledMessageJob = createJob("other");
    items.value = [sentScheduledMessageJob, otherScheduledMessageJob];
    scheduledMessageJobCount.value = 2;

    const component = await mountSuspended(MessageDraftsAndSentScheduledSendButton, {
      props: { scheduledMessageJob: sentScheduledMessageJob },
    });
    await component.get(".v-btn").trigger("click");
    await flushPromises();

    expect(items.value.map(({ id }) => id)).toStrictEqual([otherScheduledMessageJob.id]);
    expect(scheduledMessageJobCount.value).toBe(1);
  });
});
