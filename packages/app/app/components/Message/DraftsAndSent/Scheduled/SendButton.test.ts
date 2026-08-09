// @vitest-environment nuxt
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";
import type { RoomInMessage } from "@esposter/db-schema";

import MessageDraftsAndSentScheduledSendButton from "@/components/Message/DraftsAndSent/Scheduled/SendButton.vue";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { createMessageEntity, MessageType, MimeCategory, RoomType, ScheduledMessageJobType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageDraftsAndSentScheduledSendButton", () => {
  const server = setupMswTrpc();
  const userId = crypto.randomUUID();
  const room: RoomInMessage = {
    allowedMimeCategories: [MimeCategory.Audio, MimeCategory.Document, MimeCategory.Image, MimeCategory.Video],
    categoryId: null,
    createdAt: new Date("1970-01-01"),
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
    updatedAt: new Date("1970-01-01"),
    userId,
  };
  const createScheduledMessageJob = (message: string): ScheduledMessageJobInMessageWithRoom => ({
    cancelledAt: null,
    completedAt: null,
    createdAt: new Date("1970-01-01"),
    deletedAt: null,
    id: crypto.randomUUID(),
    payload: { message, type: ScheduledMessageJobType.ScheduledMessage },
    processingStartedAt: null,
    room,
    roomId: room.id,
    runAt: new Date("1970-01-02"),
    updatedAt: new Date("1970-01-01"),
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
    // The component mounts into the nuxt app's pinia, so seed the store it reads rather than a local one
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { count, items } = storeToRefs(scheduledMessageJobStore);
    const sentScheduledMessageJob = createScheduledMessageJob("sent");
    const otherScheduledMessageJob = createScheduledMessageJob("other");
    items.value = [sentScheduledMessageJob, otherScheduledMessageJob];
    count.value = 2;

    const component = await mountSuspended(MessageDraftsAndSentScheduledSendButton, {
      props: { scheduledMessageJob: sentScheduledMessageJob },
    });
    await component.get(".v-btn").trigger("click");
    await flushPromises();

    expect(items.value.map(({ id }) => id)).toStrictEqual([otherScheduledMessageJob.id]);
    expect(count.value).toBe(1);
  });
});
