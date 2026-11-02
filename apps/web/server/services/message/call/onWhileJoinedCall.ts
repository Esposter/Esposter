import type { CallEvents } from "#server/models/message/events/CallEvents";
import type { Context } from "#server/trpc/context";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";

import { onWhileCallRoomMember } from "#server/services/message/call/onWhileCallRoomMember";
import { requireJoinedCallSession } from "#server/services/message/call/requireJoinedCallSession";

// A call's events for a participant who is in it: the join is the gate the subscription opens on, and
// `onWhileCallRoomMember` ends the stream when the subscriber's access to the call lapses
export const onWhileJoinedCall = <TKey extends keyof CallEvents & string>(
  { db, getSessionPayload }: { db: Context["db"]; getSessionPayload: GetSessionPayload },
  eventName: TKey,
  callSessionId: string,
  signal?: AbortSignal,
): Promise<AsyncIterable<CallEvents[TKey]>> =>
  onWhileCallRoomMember(db, eventName, {
    callSessionId,
    gate: () => requireJoinedCallSession(db, getSessionPayload, callSessionId),
    sessionId: getSessionPayload.session.id,
    signal,
    userId: getSessionPayload.user.id,
  });
