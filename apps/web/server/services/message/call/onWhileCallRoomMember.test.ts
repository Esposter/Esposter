import type { Context } from "#server/trpc/context";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";

import { createMockSession } from "#server/auth.test";
import { callSessionParticipantMap } from "#server/services/message/call/callSessionParticipantMap";
import { createCallParticipant } from "#server/services/message/call/createCallParticipant";
import { createParticipant } from "#server/services/message/call/createParticipant";
import { createStandaloneCallSessionId } from "#server/services/message/call/createStandaloneCallSessionId";
import { leaveCallAsParticipant } from "#server/services/message/call/leaveCallAsParticipant";
import { onWhileCallRoomMember } from "#server/services/message/call/onWhileCallRoomMember";
import { requireJoinedCallSession } from "#server/services/message/call/requireJoinedCallSession";
import { callEventEmitter } from "#server/services/message/events/callEventEmitter";
import { createMockContext, createMockUser } from "#server/trpc/context.test";
import { callSessionsInMessage } from "@esposter/db-schema";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(onWhileCallRoomMember, () => {
  let controller: AbortController;
  let mockContext: Context;

  const createSessionPayload = async (): Promise<GetSessionPayload> => {
    const user = await createMockUser(mockContext.db);
    return { session: createMockSession(user.id), user };
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  beforeEach(() => {
    controller = new AbortController();
  });

  afterEach(async () => {
    controller.abort();
    callSessionParticipantMap.clear();
    await mockContext.db.delete(callSessionsInMessage);
  });

  // The helper resolves once its listeners are attached and its gate has passed, so the leave below lands on streams
  // That are already open
  test("ends a standalone call's events for the participant who leaves, and not for the others", async () => {
    expect.hasAssertions();

    const creator = await createMockUser(mockContext.db);
    const callSessionId = await createStandaloneCallSessionId(mockContext.db, creator.id);
    const leaver = await createSessionPayload();
    const other = await createSessionPayload();
    createCallParticipant(callSessionId, createParticipant(leaver.session, leaver.user));
    createCallParticipant(callSessionId, createParticipant(other.session, other.user));
    const leavingEvents = await onWhileCallRoomMember(mockContext.db, "muteChanged", {
      callSessionId,
      gate: () => requireJoinedCallSession(mockContext.db, leaver, callSessionId),
      sessionId: leaver.session.id,
      signal: controller.signal,
      userId: leaver.user.id,
    });
    const otherEvents = await onWhileCallRoomMember(mockContext.db, "muteChanged", {
      callSessionId,
      gate: () => requireJoinedCallSession(mockContext.db, other, callSessionId),
      sessionId: other.session.id,
      signal: controller.signal,
      userId: other.user.id,
    });

    await leaveCallAsParticipant(mockContext.db, callSessionId, leaver.session.id, leaver.user.id);
    // The call still raises an event after the leave, which a stream still open would yield
    callEventEmitter.emit("muteChanged", { callSessionId, id: other.session.id, isMuted: true });
    const [left, stayed] = await Promise.allSettled([
      leavingEvents[Symbol.asyncIterator]().next(),
      otherEvents[Symbol.asyncIterator]().next(),
    ]);

    expect(left).toStrictEqual({ status: "fulfilled", value: { done: true, value: undefined } });
    expect(stayed).toStrictEqual({
      status: "fulfilled",
      value: { done: false, value: [{ callSessionId, id: other.session.id, isMuted: true }] },
    });
  });
});
