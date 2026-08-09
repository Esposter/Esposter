// @vitest-environment nuxt
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";
import type { RoomInMessage } from "@esposter/db-schema";

import MessageDraftsAndSentScheduledSendButton from "@/components/Message/DraftsAndSent/Scheduled/SendButton.vue";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { MimeCategory, RoomType, ScheduledMessageJobType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
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

  // A rejected send owes back the row it took off the page and nothing else — the page is also fed by reads and
  // Pushes, so reinstating the copy this write was issued with drops whatever landed while it was in flight
  test("restores only its own job when the send is rejected", async () => {
    expect.hasAssertions();

    let signalSendRequested = noop;
    const sendRequested = new Promise<void>((resolve) => {
      signalSendRequested = resolve;
    });
    let releaseSend = noop;
    const sendReleased = new Promise<void>((resolve) => {
      releaseSend = resolve;
    });
    server.use(
      trpcMsw.message.scheduledMessageJob.sendScheduledMessageNow.mutation(async () => {
        signalSendRequested();
        await sendReleased;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "rejected" });
      }),
    );
    // The component mounts into the nuxt app's pinia, so seed the store it reads rather than a local one
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { count, items } = storeToRefs(scheduledMessageJobStore);
    const sentScheduledMessageJob = createScheduledMessageJob("sent");
    items.value = [sentScheduledMessageJob];
    count.value = 1;

    const component = await mountSuspended(MessageDraftsAndSentScheduledSendButton, {
      props: { scheduledMessageJob: sentScheduledMessageJob },
    });
    await component.get(".v-btn").trigger("click");
    await sendRequested;
    // A job the page gained while the send was in flight
    const arrivedScheduledMessageJob = createScheduledMessageJob("arrived");
    items.value = [arrivedScheduledMessageJob];
    count.value = 1;
    releaseSend();
    await flushPromises();

    expect(items.value.map(({ id }) => id)).toStrictEqual([arrivedScheduledMessageJob.id, sentScheduledMessageJob.id]);
    expect(count.value).toBe(2);
  });
});
