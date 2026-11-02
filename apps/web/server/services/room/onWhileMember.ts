import type { RoomEvents } from "#server/models/message/events/RoomEvents";
import type { EventEmitter } from "node:events";

import { onUntilDeparture } from "#server/services/events/onUntilDeparture";
import { roomEventEmitter } from "#server/services/message/events/roomEventEmitter";

// The events of `eventEmitter` for as long as `userId` is still a member of `roomId`. A subscription checks its
// Membership once, when it opens, so a departure has to end the stream itself: a leave, a kick and a ban all announce
// Themselves as `leaveRoom` (announceRoomMemberRemoval), and the stream ends on that event
export const onWhileMember = <TKey extends keyof TEventMap, TEventMap extends Record<TKey, TEventMap[TKey]>>(
  eventEmitter: EventEmitter<TEventMap>,
  eventName: string & TKey,
  { roomId, signal, userId }: { roomId: string; signal?: AbortSignal; userId: string },
): AsyncIterable<TEventMap[TKey]> =>
  onUntilDeparture(eventEmitter, eventName, {
    onDeparture: (depart) => {
      const onLeaveRoom = (leave: RoomEvents["leaveRoom"][0]) => {
        if (leave.roomId === roomId && leave.userId === userId) depart();
      };
      roomEventEmitter.on("leaveRoom", onLeaveRoom);
      return () => {
        roomEventEmitter.off("leaveRoom", onLeaveRoom);
      };
    },
    signal,
  });
