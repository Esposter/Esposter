// @vitest-environment nuxt
import { useCancelScheduledMessageJobToDraft } from "#src/composables/message/draftsAndSent/useCancelScheduledMessageJobToDraft";
import { createScheduledMessageJob } from "#src/services/message/draftsAndSent/createScheduledMessageJob.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useInputStore } from "#src/store/message/input/index";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe(useCancelScheduledMessageJobToDraft, () => {
  const { trpcMsw } = setupMswTrpc();

  test("writes the job's text to its room's composer as the cancel is sent, and keeps it once the cancel lands", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = createScheduledMessageJob();
    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => undefined);
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);
    useCancelScheduledMessageJobToDraft()(scheduledMessageJob);

    expect(drafts.value.has(scheduledMessageJob.roomId)).toBe(true);
    await flushPromises();
    expect(drafts.value.has(scheduledMessageJob.roomId)).toBe(true);
  });

  // A rejected cancel leaves the job scheduled, so the composer must not keep its text: a send from it would post
  // A second copy beside the one the schedule still delivers
  test("leaves the composer as it was when the cancel is rejected", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = createScheduledMessageJob();
    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);
    useCancelScheduledMessageJobToDraft()(scheduledMessageJob);
    await flushPromises();

    expect(drafts.value.has(scheduledMessageJob.roomId)).toBe(false);
  });

  test("gives the composer back the draft it held before the job's text when the cancel is rejected", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = createScheduledMessageJob();
    trpcMsw.message.scheduledMessageJob.cancelScheduledMessageJob.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);
    inputStore.setDraft(scheduledMessageJob.roomId, "Held before");
    const previousContent = drafts.value.get(scheduledMessageJob.roomId)?.content;
    useCancelScheduledMessageJobToDraft()(scheduledMessageJob);
    await flushPromises();

    expect(drafts.value.get(scheduledMessageJob.roomId)?.content).toBe(previousContent);
  });
});
