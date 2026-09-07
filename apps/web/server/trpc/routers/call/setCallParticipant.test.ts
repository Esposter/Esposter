import type { getMockSession } from "@@/server/trpc/context.test";

import { callSessionParticipantMap } from "@@/server/services/message/call/callSessionParticipantMap";
import { createParticipant } from "@@/server/services/message/call/createParticipant";
import { describe } from "vitest";

// Joining a call is a websocket handshake no caller can drive, so a test that needs someone already in one puts
// Them there — through the factory production writes with, rather than a participant row built beside it
export const setCallParticipant = (callSessionId: string, { session, user }: ReturnType<typeof getMockSession>) => {
  callSessionParticipantMap.set(callSessionId, new Map([[session.id, createParticipant(session, user)]]));
};

describe.todo("setCallParticipant");
