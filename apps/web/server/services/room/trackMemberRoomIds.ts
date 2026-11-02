import type { RoomEvents } from "#server/models/message/events/RoomEvents";

import { roomEventEmitter } from "#server/services/message/events/roomEventEmitter";

// The rooms a multi-room stream delivers for, read as of each event. It starts from the rooms the client listed, which
// `assertIsMember` has just checked, and moves with the member's own joins and leaves for as long as the signal lasts.
// A stream that checked membership only when it opened would keep delivering a room it has left, and would never
// Deliver one it joined while open. Listeners end with the signal, as `onWhileMember`'s do
export const trackMemberRoomIds = (
  roomIds: string[],
  { signal, userId }: { signal?: AbortSignal; userId: string },
): Set<string> => {
  const memberRoomIds = new Set(roomIds);
  const onJoinRoom = ({ roomId, user }: RoomEvents["joinRoom"][0]) => {
    if (user.id === userId) memberRoomIds.add(roomId);
  };
  const onLeaveRoom = ({ roomId, userId: leavingUserId }: RoomEvents["leaveRoom"][0]) => {
    if (leavingUserId === userId) memberRoomIds.delete(roomId);
  };
  roomEventEmitter.on("joinRoom", onJoinRoom);
  roomEventEmitter.on("leaveRoom", onLeaveRoom);
  signal?.addEventListener(
    "abort",
    () => {
      roomEventEmitter.off("joinRoom", onJoinRoom);
      roomEventEmitter.off("leaveRoom", onLeaveRoom);
    },
    { once: true },
  );
  return memberRoomIds;
};
