// @vitest-environment nuxt
import { useCancelScheduledMessageJobToDraft } from "#src/composables/message/draftsAndSent/useCancelScheduledMessageJobToDraft";
import { createScheduledMessageJob } from "#src/services/message/draftsAndSent/createScheduledMessageJob.test";
import { getScheduledMessageJobText } from "#src/services/message/draftsAndSent/getScheduledMessageJobText";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useInputStore } from "#src/store/message/input/index";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useCancelScheduledMessageJobToDraft, () => {
  const { trpcMsw } = setupMswTrpc();

  // The composer takes the job's text only once the server has answered the cancel, so it is never handed text for a
  // Job that is still scheduled
  test("writes the job's text to its room's composer once the cancel is answered", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = createScheduledMessageJob();
    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => ({
      kind: ScheduledMessageJobType.ScheduledMessage,
      row: {
        deletedAt: new Date(0),
        id: scheduledMessageJob.id,
        message: "",
        replyToId: null,
        runAt: new Date(0),
        userId: v7(),
        version: 1,
      },
    }));
    trpcMsw.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query(() => 0);
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);
    useCancelScheduledMessageJobToDraft()(scheduledMessageJob);

    expect(drafts.value.has(scheduledMessageJob.roomId)).toBe(false);
    await flushPromises();
    expect(drafts.value.get(scheduledMessageJob.roomId)?.content).toBe(getScheduledMessageJobText(scheduledMessageJob));
  });

  // A rejected cancel leaves the job scheduled, so the composer must not take its text: a send from it would post a
  // Second copy beside the one the schedule still delivers
  test("leaves the composer as it was when the cancel is rejected", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = createScheduledMessageJob();
    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query(() => 0);
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);
    useCancelScheduledMessageJobToDraft()(scheduledMessageJob);
    await flushPromises();

    expect(drafts.value.has(scheduledMessageJob.roomId)).toBe(false);
  });
});
