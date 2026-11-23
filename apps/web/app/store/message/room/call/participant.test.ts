// @vitest-environment nuxt
import type { CallParticipant, CallParticipantRow } from "@esposter/db-schema";

import { getMockSession } from "#server/trpc/context.test";
import { createId } from "#shared/util/math/random/createId";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useParticipantStore } from "#src/store/message/room/call/participant";
import { CALL_ID_LENGTH } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The caller's own participant, under the id its join would mint for it, the shape every write here addresses
const createOwnParticipant = (): CallParticipant => {
  const { user } = getMockSession();
  return {
    id: v7(),
    image: user.image ?? "",
    isCameraEnabled: false,
    isHandRaised: false,
    isMuted: false,
    name: user.name,
    userId: user.id,
  };
};

const createParticipant = (): CallParticipant => ({
  id: v7(),
  image: "image",
  isCameraEnabled: false,
  isHandRaised: false,
  isMuted: false,
  name: "name",
  userId: v7(),
});

// A participant's row as the call object holds it: live, at the version it was written at
const createRow = (participant: CallParticipant, version: number): CallParticipantRow => ({
  ...participant,
  deletedAt: null,
  version,
});

// The same row after its participant left, one version on, as the leave's frame and the object both carry it
const createTombstone = (row: CallParticipantRow): CallParticipantRow => ({
  ...row,
  deletedAt: new Date(0),
  version: row.version + 1,
});

describe(useParticipantStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const callSessionId = createId(CALL_ID_LENGTH);

  // A tombstone past its retention is forgotten by the client's clock, so the clock is the epoch the tombstones are
  // Dated from
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("deleteSpeaker removes the id from speakingIds", () => {
    expect.hasAssertions();

    const participantStore = useParticipantStore();
    const { deleteSpeaker } = participantStore;
    const { speakingIds } = storeToRefs(participantStore);
    const participantId = v7();
    speakingIds.value = [participantId];
    deleteSpeaker(participantId);

    expect(speakingIds.value).toStrictEqual([]);
  });

  test("a hand raise arrives as the participant's row at its new version", () => {
    expect.hasAssertions();

    const participant = createOwnParticipant();
    const participantStore = useParticipantStore();
    const { callSessionParticipantsMap } = storeToRefs(participantStore);
    const { storeCallParticipant, storeCallParticipants } = participantStore;
    storeCallParticipants(callSessionId, [createRow(participant, 1)]);
    storeCallParticipant(callSessionId, { ...createRow(participant, 2), isHandRaised: true });

    expect(callSessionParticipantsMap.value.get(callSessionId)?.get(participant.id)?.isHandRaised).toBe(true);
  });

  test("a participant's row is held once, however often its arrival repeats", () => {
    expect.hasAssertions();

    const participant = createOwnParticipant();
    const participantStore = useParticipantStore();
    const { callSessionParticipantsMap } = storeToRefs(participantStore);
    const { storeCallParticipants } = participantStore;
    storeCallParticipants(callSessionId, [createRow(participant, 1)]);
    storeCallParticipants(callSessionId, [createRow(participant, 1)]);

    expect(callSessionParticipantsMap.value.get(callSessionId)?.size).toBe(1);
  });

  // The read is in flight when the leave lands, so the leave arrives first and the read answers with the leaver's
  // Row as it stood before it. That older row must lose to the tombstone, or the leaver is back in the call
  test("a late read does not re-add a participant who left", async () => {
    expect.hasAssertions();

    const { $trpc } = useNuxtApp();
    const participantStore = useParticipantStore();
    const { callSessionParticipantsMap } = storeToRefs(participantStore);
    const { readCallParticipants, storeCallParticipant } = participantStore;
    const kept = createRow(createParticipant(), 1);
    const left = createRow(createParticipant(), 1);
    trpcMsw.callSession.readCallParticipantMap.query(() => {
      storeCallParticipant(callSessionId, createTombstone(left));
      return new Map([
        [kept.id, kept],
        [left.id, left],
      ]);
    });
    await readCallParticipants(callSessionId, () => $trpc.callSession.readCallParticipantMap.query({ callSessionId }));

    expect([...(callSessionParticipantsMap.value.get(callSessionId)?.keys() ?? [])]).toStrictEqual([kept.id]);
  });
});
