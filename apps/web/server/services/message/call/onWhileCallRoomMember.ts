import type { CallEvents } from "#server/models/message/events/CallEvents";
import type { Context } from "#server/trpc/context";

import { onUntilDeparture } from "#server/services/events/onUntilDeparture";
import { requireCallSession } from "#server/services/message/call/requireCallSession";
import { callEventEmitter } from "#server/services/message/events/callEventEmitter";
import { onWhileMember } from "#server/services/room/onWhileMember";

// A call's events for as long as the subscriber stays in it. In a room the subscriber's membership of the room ends
// Them, as it ends the room's own streams. A standalone call has no room, so the subscriber's own `leaveCall` ends them,
// The event every removal of a participant emits. The room is read before the listeners attach and the open-time `gate`
// Runs after, so a departure that lands between the two is seen by the gate, which reads membership from the database
export const onWhileCallRoomMember = async <TKey extends keyof CallEvents & string>(
  db: Context["db"],
  eventName: TKey,
  {
    callSessionId,
    gate,
    sessionId,
    signal,
    userId,
  }: { callSessionId: string; gate: () => Promise<unknown>; sessionId: string; signal?: AbortSignal; userId: string },
): Promise<AsyncIterable<CallEvents[TKey]>> => {
  const { roomId } = await requireCallSession(db, callSessionId);
  const events = roomId
    ? onWhileMember(callEventEmitter, eventName, { roomId, signal, userId })
    : onUntilDeparture(callEventEmitter, eventName, {
        onDeparture: (depart) => {
          const onLeaveCall = (leave: CallEvents["leaveCall"][0]) => {
            if (leave.callSessionId === callSessionId && leave.id === sessionId) depart();
          };
          callEventEmitter.on("leaveCall", onLeaveCall);
          return () => {
            callEventEmitter.off("leaveCall", onLeaveCall);
          };
        },
        signal,
      });
  await gate();
  return events;
};
