import { callSessionParticipantMap } from "@@/server/services/message/call/callSessionParticipantMap";
import { getForbiddenError } from "@@/server/trpc/guards/getForbiddenError";
// The live participant row is the only place a per-session flag lives: a session with no row has not joined,
// Whether it is the caller's own or the target of a moderation
export const requireCallParticipant = (callSessionId: string, sessionId: string) => {
  const participant = callSessionParticipantMap.get(callSessionId)?.get(sessionId);
  if (!participant) throw getForbiddenError("Must join call first");
  return participant;
};
