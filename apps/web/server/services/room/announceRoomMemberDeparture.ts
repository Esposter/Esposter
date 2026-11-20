import type { UserEvent, UserToRoomInMessage } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { notifyOnlineRoomMembers } from "#server/services/room/notifyOnlineRoomMembers";
import { getResultAsync, noop } from "@esposter/shared";

// Every departure from a room, a leave or a removal, drops the member from the room's object (its sockets, and what they
// Scheduled there, and their own object's reminders for it), then tells the members the room has online and the member's
// Own tabs. The member is dropped first, so the members the room reaches are the ones who stayed. The event carries the
// Tombstone the departure left, at its version, so a list holding the row drops it by the same rule as any arrival. The
// Leaver's own tabs also take their membership row, which their room list reads
export const announceRoomMemberDeparture = async (userToRoom: UserToRoomInMessage): Promise<void> => {
  const { deletedAt, displayName, roomId, userId, version } = userToRoom;
  await getResultAsync(() => useRoomObject(roomId).removeMember(userId)).match(noop, (error) => {
    console.error("A departed member's room state failed to clear", { error, roomId, userId });
  });
  const event = { data: { deletedAt, displayName, roomId, userId, version }, type: "leaveRoom" } satisfies UserEvent;
  await Promise.all([
    notifyOnlineRoomMembers(roomId, event),
    callUserObjects([userId], (userObject) => userObject.broadcastEvent(event)),
    callUserObjects([userId], (userObject) => userObject.updateUserToRoom(userToRoom)),
  ]);
};
