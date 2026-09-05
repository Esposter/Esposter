// @vitest-environment nuxt
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { useParticipantStore } from "@/store/message/room/call/participant";
import { getMockSession } from "@@/server/trpc/context.test";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

// The session user as a participant row — the shape every write here addresses
const createSessionParticipant = (): CallParticipant => {
  const { session, user } = getMockSession();
  return {
    id: session.id,
    image: user.image,
    isCameraEnabled: false,
    isHandRaised: false,
    isMuted: false,
    name: user.name,
    userId: user.id,
  };
};

describe(useParticipantStore, () => {
  const callSessionId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("createSpeaker adds the id to speakingIds", () => {
    expect.hasAssertions();

    const participantStore = useParticipantStore();
    const { createSpeaker } = participantStore;
    const { speakingIds } = storeToRefs(participantStore);
    const sessionId = getMockSession().session.id;
    createSpeaker(sessionId);

    expect(speakingIds.value).toStrictEqual([sessionId]);
  });

  test("createSpeaker is idempotent", () => {
    expect.hasAssertions();

    const participantStore = useParticipantStore();
    const { createSpeaker } = participantStore;
    const { speakingIds } = storeToRefs(participantStore);
    const sessionId = getMockSession().session.id;
    createSpeaker(sessionId);
    createSpeaker(sessionId);

    expect(speakingIds.value).toHaveLength(1);
  });

  test("deleteSpeaker removes the id from speakingIds", () => {
    expect.hasAssertions();

    const participantStore = useParticipantStore();
    const { createSpeaker, deleteSpeaker } = participantStore;
    const { speakingIds } = storeToRefs(participantStore);
    const sessionId = getMockSession().session.id;
    createSpeaker(sessionId);
    deleteSpeaker(sessionId);

    expect(speakingIds.value).toStrictEqual([]);
  });

  test("setParticipantHandRaised sets the raised hand state", () => {
    expect.hasAssertions();

    const participant = createSessionParticipant();
    const participantStore = useParticipantStore();
    const { createCallParticipant, setParticipantHandRaised } = participantStore;
    const { callSessionParticipantsMap } = storeToRefs(participantStore);
    createCallParticipant(callSessionId, participant);
    setParticipantHandRaised(callSessionId, participant.id, true);

    expect(callSessionParticipantsMap.value.get(callSessionId)?.get(participant.id)?.isHandRaised).toBe(true);

    setParticipantHandRaised(callSessionId, participant.id, false);

    expect(callSessionParticipantsMap.value.get(callSessionId)?.get(participant.id)?.isHandRaised).toBe(false);
  });

  test("createCallParticipant adds the participant to the session", () => {
    expect.hasAssertions();

    const participant = createSessionParticipant();
    const participantStore = useParticipantStore();
    const { createCallParticipant } = participantStore;
    const { callSessionParticipantsMap } = storeToRefs(participantStore);
    createCallParticipant(callSessionId, participant);

    const sessionMap = callSessionParticipantsMap.value.get(callSessionId);

    expect(sessionMap?.size).toBe(1);
    expect(sessionMap?.get(participant.id)).toStrictEqual(participant);
  });

  test("createCallParticipant is idempotent", () => {
    expect.hasAssertions();

    const participant = createSessionParticipant();
    const participantStore = useParticipantStore();
    const { createCallParticipant } = participantStore;
    const { callSessionParticipantsMap } = storeToRefs(participantStore);
    createCallParticipant(callSessionId, participant);
    createCallParticipant(callSessionId, participant);

    expect(callSessionParticipantsMap.value.get(callSessionId)?.size).toBe(1);
  });

  test("setParticipantMuted updates the participant mute state", () => {
    expect.hasAssertions();

    const participant = createSessionParticipant();
    const participantStore = useParticipantStore();
    const { createCallParticipant, setParticipantMuted } = participantStore;
    const { callSessionParticipantsMap } = storeToRefs(participantStore);
    createCallParticipant(callSessionId, participant);
    setParticipantMuted(callSessionId, participant.id, true);

    expect(callSessionParticipantsMap.value.get(callSessionId)?.get(participant.id)?.isMuted).toBe(true);
  });
});
