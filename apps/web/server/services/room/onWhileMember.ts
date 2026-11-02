import type { RoomEvents } from "#server/models/message/events/RoomEvents";
import type { EventEmitter } from "node:events";

import { on } from "#server/services/events/on";
import { roomEventEmitter } from "#server/services/message/events/roomEventEmitter";
import { getResultAsync } from "@esposter/shared";

// The events of `eventEmitter` for as long as `userId` is still a member of `roomId`. A subscription checks its
// Membership once, when it opens, so a departure has to end the stream itself: a leave, a kick and a ban all announce
// Themselves as `leaveRoom` (announceRoomMemberRemoval), and the stream ends on that event. The listeners are attached
// Here, not when the stream is first read, so a caller that awaits before its
// First read cannot miss a departure that lands in that gap
export const onWhileMember = <TKey extends keyof TEventMap, TEventMap extends Record<TKey, TEventMap[TKey]>>(
  eventEmitter: EventEmitter<TEventMap>,
  eventName: string & TKey,
  { roomId, signal, userId }: { roomId: string; signal?: AbortSignal; userId: string },
): AsyncIterable<TEventMap[TKey]> => {
  const departure = new AbortController();
  const events = on(eventEmitter, eventName, {
    signal: signal ? AbortSignal.any([signal, departure.signal]) : departure.signal,
  });
  const onLeaveRoom = (leave: RoomEvents["leaveRoom"][0]) => {
    if (leave.roomId !== roomId || leave.userId !== userId) return;
    roomEventEmitter.off("leaveRoom", onLeaveRoom);
    departure.abort();
  };
  roomEventEmitter.on("leaveRoom", onLeaveRoom);
  signal?.addEventListener(
    "abort",
    () => {
      roomEventEmitter.off("leaveRoom", onLeaveRoom);
    },
    { once: true },
  );
  // The departure aborts the read that is waiting, and an aborted read is the stream's end rather than a failure.
  // Any other rejection is the stream's own error, and is thrown as it was
  const next = () =>
    getResultAsync(() => events.next()).match(
      (result) => result,
      (error) => {
        if (departure.signal.aborted) return { done: true, value: undefined };
        throw error;
      },
    );
  return { [Symbol.asyncIterator]: () => ({ next }) };
};
