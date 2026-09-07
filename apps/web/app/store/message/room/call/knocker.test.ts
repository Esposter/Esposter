// @vitest-environment nuxt
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

const createParticipant = (name: string): CallParticipant => ({
  id: crypto.randomUUID(),
  image: "",
  isCameraEnabled: false,
  isHandRaised: false,
  isMuted: false,
  name,
  userId: crypto.randomUUID(),
});

describe(useKnockerStore, () => {
  const server = setupMswTrpc();
  const callId = "callId";
  const callSessionId = crypto.randomUUID();
  const rejectedCallId = "rejectedCallId";
  const first = createParticipant("first");
  const second = createParticipant("second");

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

  // Each knocker is its own target, so a host working down the lobby has several writes in flight at once
  test("puts back only the knocker whose admission was rejected, where they stood", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.callSession.knocker.admitKnocker.mutation(({ input: { sessionId } }) => {
        if (sessionId === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const knockerStore = useKnockerStore();
    const { admitKnocker, createKnocker } = knockerStore;
    const { knockers } = storeToRefs(knockerStore);
    createKnocker(first);
    createKnocker(second);
    await Promise.all([admitKnocker(callSessionId, first.id), admitKnocker(callSessionId, second.id)]);

    expect(knockers.value).toStrictEqual([first]);
  });

  test("keeps a knocker that arrived while a dismissal was in flight", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.callSession.knocker.dismissKnocker.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const knockerStore = useKnockerStore();
    const { createKnocker, dismissKnocker } = knockerStore;
    const { knockers } = storeToRefs(knockerStore);
    createKnocker(first);
    const dismissal = dismissKnocker(callSessionId, first.id);
    createKnocker(second);
    await dismissal;

    expect(knockers.value).toStrictEqual([first, second]);
  });
});
