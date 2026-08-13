// @vitest-environment nuxt
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useKnockerStore, () => {
  const server = setupMswTrpc();
  const callId = "callId";
  const rejectedCallId = "rejectedCallId";

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Only one knock is active at a time, so both knocks share a target and the second waits for the first. Its
  // Rollback owes the lobby the first knock left — restoring what was held when the user clicked drops them out
  // Of a call they are still knocking on
  test("rolls a queued knock back to the call the knock ahead of it stored", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.callSession.knocker.knockCall.mutation(({ input }) => {
        if (input.id === rejectedCallId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const knockerStore = useKnockerStore();
    const { knockingCallSessionId } = storeToRefs(knockerStore);
    const { knockCall } = knockerStore;
    await Promise.all([knockCall(callId), knockCall(rejectedCallId)]);

    expect(knockingCallSessionId.value).toBe(callId);
  });
});
