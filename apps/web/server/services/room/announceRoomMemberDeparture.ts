import type { UserEvent, UserToRoomInMessage } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { notifyOnlineRoomMembers } from "#server/services/room/notifyOnlineRoomMembers";
import { getResultAsync, noop } from "@esposter/shared";

// Every departure from a room, a leave or a removal, drops the member from the room's object (its sockets, and what they
// Scheduled there, and their own object's reminders for it), then tells the members the room has online and the member's
// Own tabs. The member is dropped first, so the members the room reaches are the ones who stayed
export const announceRoomMemberDeparture = async ({
  roomId,
  userId,
}: Pick<UserToRoomInMessage, "roomId" | "userId">): Promise<void> => {
  await getResultAsync(() => useRoomObject(roomId).removeMember(userId)).match(noop, (error) => {
    console.error("A departed member's room state failed to clear", { error, roomId, userId });
  });
  const event = { data: { roomId, userId }, type: "leaveRoom" } satisfies UserEvent;
  await Promise.all([
    notifyOnlineRoomMembers(roomId, event),
    callUserObjects([userId], (userObject) => userObject.broadcastEvent(event)),
  ]);
};
