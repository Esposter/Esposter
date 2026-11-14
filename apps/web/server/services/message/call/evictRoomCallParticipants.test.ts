import type { CallEvents } from "#server/models/message/events/CallEvents";
import type { Context } from "#server/trpc/context";

import { callSessionParticipantMap } from "#server/services/message/call/callSessionParticipantMap";
import { createCallSessionId } from "#server/services/message/call/createCallSessionId";
import { createParticipant } from "#server/services/message/call/createParticipant";
import { evictRoomCallParticipants } from "#server/services/message/call/evictRoomCallParticipants";
import { callEventEmitter } from "#server/services/message/events/callEventEmitter";
import { PublishSource } from "#server/services/realtimeKit/constants";
import { realtimeKitParticipantMap } from "#server/services/realtimeKit/realtimeKitParticipantMap";
import { createCallerFactory } from "#server/trpc";
import { getMockSession } from "#server/trpc/context.test";
import { setupCallSuite } from "#server/trpc/routers/call/setupCallSuite.test";
import { createRoomMember } from "#server/trpc/routers/createRoomMember.test";
import { roomRouter } from "#server/trpc/routers/room";
import { callSessionsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe(evictRoomCallParticipants, () => {
  const { getMockContext } = setupCallSuite();
  const meetingId = crypto.randomUUID();
  const name = "name";
  const realtimeKitParticipantId = crypto.randomUUID();
  const ownerSessionId = crypto.randomUUID();
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;
  let joinEvents: CallEvents["joinCall"][0][];
  let mockContext: Context;

  beforeAll(() => {
    mockContext = getMockContext();
  });

  beforeEach(() => {
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "accountId");
    vi.stubEnv("REALTIMEKIT_API_TOKEN", "apiToken");
    vi.stubEnv("REALTIMEKIT_APP_ID", "appId");
    fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(Response.json({ success: true })));
    vi.stubGlobal("fetch", fetchMock);
    joinEvents = [];
    callEventEmitter.on("joinCall", (event) => {
      joinEvents.push(event);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    callEventEmitter.removeAllListeners("joinCall");
    realtimeKitParticipantMap.clear();
  });

  // A moderator's kick is a plain departure: the member leaves the call and is dropped at RealtimeKit, and nothing is
  // Added back under them, so no rejoin token is handed out
  test("a moderator's kick removes the member's connection and hands out no rejoin token", async () => {
    expect.hasAssertions();

    const room = await createCallerFactory(roomRouter)(mockContext).createRoom({ name });
    const callSessionId = await createCallSessionId(mockContext.db, room.id, getMockSession().user.id);
    await mockContext.db
      .update(callSessionsInMessage)
      .set({ meetingId })
      .where(eq(callSessionsInMessage.id, callSessionId));
    const user = await createRoomMember(mockContext, room.id);
    const sessionId = crypto.randomUUID();
    callSessionParticipantMap.set(
      callSessionId,
      new Map([
        [sessionId, createParticipant({ id: sessionId }, user)],
        [ownerSessionId, createParticipant({ id: ownerSessionId }, getMockSession().user)],
      ]),
    );
    realtimeKitParticipantMap.set(
      callSessionId,
      new Map([
        [sessionId, { id: realtimeKitParticipantId, isRejoining: false, publishSources: [PublishSource.Microphone] }],
      ]),
    );

    await evictRoomCallParticipants(mockContext.db, room.id, user.id);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining(`/meetings/${meetingId}/active-session/kick`),
      expect.objectContaining({ body: JSON.stringify({ custom_participant_ids: [sessionId] }), method: "POST" }),
    );
    expect(callSessionParticipantMap.get(callSessionId)?.has(sessionId)).toBe(false);
    expect(joinEvents).toStrictEqual([]);
  });
});
