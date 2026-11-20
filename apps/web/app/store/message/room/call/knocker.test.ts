// @vitest-environment nuxt
import type { CallParticipant, CallParticipantRow } from "@esposter/db-schema";

import { createId } from "#shared/util/math/random/createId";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useKnockerStore } from "#src/store/message/room/call/knocker";
import { CALL_ID_LENGTH } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

const createParticipant = (name: string): CallParticipant => ({
  id: v7(),
  image: "",
  isCameraEnabled: false,
  isHandRaised: false,
  isMuted: false,
  name,
  userId: v7(),
});

// A knocker's row as the call object holds it: live, at the version it was written at
const createRow = (knocker: CallParticipant, version: number): CallParticipantRow => ({
  ...knocker,
  deletedAt: null,
  version,
});

describe(useKnockerStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const callId = createId(CALL_ID_LENGTH);
  const callSessionId = createId(CALL_ID_LENGTH);
  const rejectedCallId = createId(CALL_ID_LENGTH);
  const first = createParticipant("first");
  const second = createParticipant("second");

  // Only one knock is held by the server at a time, so the second knock waits for the first to be recorded
  test("a refused knock leaves the knock ahead of it standing", async () => {
    expect.hasAssertions();

    trpcMsw.callSession.knocker.knockCall.mutation(({ input }) => {
      if (input.id === rejectedCallId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const knockerStore = useKnockerStore();
    const { knockingCallSessionId } = storeToRefs(knockerStore);
    const { knockCall } = knockerStore;
    await Promise.all([knockCall(callId), knockCall(rejectedCallId)]);

    expect(knockingCallSessionId.value).toBe(callId);
  });

  // The knock is held by the server until it records it, so the waiting screen shows only once the call has answered
  test("a knock shows the waiting screen only once the server has recorded it", async () => {
    expect.hasAssertions();

    const { promise: isRecorded, resolve } = Promise.withResolvers<void>();
    trpcMsw.callSession.knocker.knockCall.mutation(async () => {
      await isRecorded;
    });
    const knockerStore = useKnockerStore();
    const { knockingCallSessionId } = storeToRefs(knockerStore);
    const knock = knockerStore.knockCall(callId);
    await flushPromises();
    const isWaitingWhileRecording = knockingCallSessionId.value;
    resolve();
    await knock;

    expect(isWaitingWhileRecording).toBe("");
    expect(knockingCallSessionId.value).toBe(callId);
  });

  // A refused admission answers no row, so nothing is let in and the knocker stays in the lobby where it stood. The other
  // Admission is the one that lands
  test("puts back only the knocker whose admission was refused, where they stood", async () => {
    expect.hasAssertions();

    trpcMsw.callSession.knocker.admitKnocker.mutation(({ input: { knockerId } }) => {
      if (knockerId === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      return { ...createRow(second, 1), deletedAt: new Date(0), version: 2 };
    });
    const knockerStore = useKnockerStore();
    const { admitKnocker, createKnocker } = knockerStore;
    const { knockers } = storeToRefs(knockerStore);
    createKnocker(callSessionId, createRow(first, 0));
    createKnocker(callSessionId, createRow(second, 1));
    admitKnocker(callSessionId, first.id);
    admitKnocker(callSessionId, second.id);
    await flushPromises();

    expect(knockers.value.map(({ id }) => id)).toStrictEqual([first.id]);
  });

  // The server refuses an admission it does not record. Its answer names no row, so nothing is let in and the knocker
  // Stays in the lobby where it stood
  test("a refused admit leaves the knocker waiting", async () => {
    expect.hasAssertions();

    trpcMsw.callSession.knocker.admitKnocker.mutation(() => null);
    const knockerStore = useKnockerStore();
    const { admitKnocker, createKnocker } = knockerStore;
    const { knockers } = storeToRefs(knockerStore);
    createKnocker(callSessionId, createRow(first, 0));
    admitKnocker(callSessionId, first.id);
    await flushPromises();

    expect(knockers.value.map(({ id }) => id)).toStrictEqual([first.id]);
  });

  // The admission answers the knocker's tombstone, at the version its removal raised it to. A knock frame that lands after
  // It, still carrying the knocker's live row, must not bring the knocker back into the lobby
  test("a late knock frame does not bring back an admitted knocker", async () => {
    expect.hasAssertions();

    const liveRow = createRow(first, 0);
    trpcMsw.callSession.knocker.admitKnocker.mutation(() => ({ ...liveRow, deletedAt: new Date(0), version: 1 }));
    const knockerStore = useKnockerStore();
    const { admitKnocker, createKnocker } = knockerStore;
    const { knockers } = storeToRefs(knockerStore);
    createKnocker(callSessionId, liveRow);
    admitKnocker(callSessionId, first.id);
    await flushPromises();
    createKnocker(callSessionId, liveRow);

    expect(knockers.value.map(({ id }) => id)).toStrictEqual([]);
  });

  test("keeps a knocker that arrived while a dismissal was in flight", async () => {
    expect.hasAssertions();

    trpcMsw.callSession.knocker.dismissKnocker.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const knockerStore = useKnockerStore();
    const { createKnocker, dismissKnocker } = knockerStore;
    const { knockers } = storeToRefs(knockerStore);
    createKnocker(callSessionId, createRow(first, 0));
    dismissKnocker(callSessionId, first.id);
    createKnocker(callSessionId, createRow(second, 0));
    await flushPromises();

    expect(knockers.value.map(({ id }) => id)).toStrictEqual([first.id, second.id]);
  });
});
