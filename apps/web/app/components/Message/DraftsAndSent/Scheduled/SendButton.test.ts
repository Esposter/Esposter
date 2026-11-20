// @vitest-environment nuxt
import MessageDraftsAndSentScheduledSendButton from "#src/components/Message/DraftsAndSent/Scheduled/SendButton.vue";
import { createScheduledMessageJob } from "#src/services/message/draftsAndSent/createScheduledMessageJob.test";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useScheduledMessageJobStore } from "#src/store/message/scheduledMessageJob";
import { ScheduledMessageJobType } from "@esposter/db-schema";
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
    const sentScheduledMessageJob = createJob(v7());
    const otherScheduledMessageJob = createJob(v7());
    trpcMsw.message.scheduledMessage.sendScheduledMessageNow.mutation(() => {
      onSent();
      // The row the send claimed, a tombstone at the version its write named
      return {
        deletedAt: new Date(0),
        id: sentScheduledMessageJob.id,
        message: "",
        replyToId: null,
        runAt: sentScheduledMessageJob.runAt,
        userId,
        version: 1,
      };
    });
    // A send settles the badge by reading the count again, which the server answers with the one job left
    trpcMsw.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query(() => 1);
    const scheduledMessageJobStore = useScheduledMessageJobStore();
    const { items, scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
    const { readItems } = scheduledMessageJobStore;
    await readItems(() =>
      Promise.resolve({ items: [sentScheduledMessageJob, otherScheduledMessageJob], nextCursor: "" }),
    );
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
