// @vitest-environment nuxt
import { useCancelScheduledMessageJobToDraft } from "@/composables/message/draftsAndSent/useCancelScheduledMessageJobToDraft";
import { createScheduledMessageJob } from "@/services/message/draftsAndSent/createScheduledMessageJob.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useInputStore } from "@/store/message/input";
import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";

describe(useCancelScheduledMessageJobToDraft, () => {
  const { trpcMsw } = setupMswTrpc();

  test("writes the job's text to its room's composer once the cancel lands", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = createScheduledMessageJob();
    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => scheduledMessageJob);
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);
    const isCancelled = await useCancelScheduledMessageJobToDraft()(scheduledMessageJob);

    expect(isCancelled).toBe(true);
    expect(drafts.value.has(scheduledMessageJob.roomId)).toBe(true);
  });

  // A rejected cancel leaves the job scheduled, so the composer must not take its text: a send from it would post
  // A second copy beside the one the schedule still delivers
  test("leaves the composer untouched when the cancel is rejected", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = createScheduledMessageJob();
    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);
    const isCancelled = await useCancelScheduledMessageJobToDraft()(scheduledMessageJob);

    expect(isCancelled).toBe(false);
    expect(drafts.value.has(scheduledMessageJob.roomId)).toBe(false);
  });
});
