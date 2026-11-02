import type { CallEvents } from "#server/models/message/events/CallEvents";
import type { Context } from "#server/trpc/context";

import { on } from "#server/services/events/on";
import { requireCallSession } from "#server/services/message/call/requireCallSession";
import { callEventEmitter } from "#server/services/message/events/callEventEmitter";
import { onWhileMember } from "#server/services/room/onWhileMember";

// A call's events for as long as the subscriber is a member of the call's room, so a leave, a kick or a ban ends them
// The way it ends the room's own streams. The room is read before the listeners attach and the open-time `gate` runs
// After, so a departure that lands between the two is seen by the gate, which reads membership from the database. A
// Standalone call has no room to leave, so its events are gated at open alone
export const onWhileCallRoomMember = async <TKey extends keyof CallEvents & string>(
  db: Context["db"],
  eventName: TKey,
  {
    callSessionId,
    gate,
    signal,
    userId,
  }: { callSessionId: string; gate: () => Promise<unknown>; signal?: AbortSignal; userId: string },
): Promise<AsyncIterable<CallEvents[TKey]>> => {
  const { roomId } = await requireCallSession(db, callSessionId);
  const events = roomId
    ? onWhileMember(callEventEmitter, eventName, { roomId, signal, userId })
    : on(callEventEmitter, eventName, { signal });
  await gate();
  return events;
};
