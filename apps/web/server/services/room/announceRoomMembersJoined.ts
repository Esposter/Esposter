import type { Context } from "#server/trpc/context";
import type { PublicUser, UserEvent } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { notifyOnlineRoomMembers } from "#server/services/room/notifyOnlineRoomMembers";
import { getResultAsync, noop } from "@esposter/shared";
import { getDetectedUserStatus } from "@esposter/db-schema";

// A join is announced one member at a time: the room's online members hear of it, then the joiner's own tabs do, and
// the joiner is attached to the room if they are online, so the joins after theirs reach them. A joiner is attached
// only after the fan-out, so the fan-out never sends their own join to them twice
export const announceRoomMembersJoined = async (
  db: Context["db"],
  roomId: string,
  users: PublicUser[],
): Promise<void> => {
  if (users.length === 0) return;

  const statuses = await db.query.userStatusesInMessage.findMany({
    where: { userId: { in: users.map(({ id }) => id) } },
  });
  for (const user of users) {
    const event = { data: { roomId, user }, type: "joinRoom" } satisfies UserEvent;
    await notifyOnlineRoomMembers(roomId, event);
    await callUserObjects([user.id], (userObject) => userObject.broadcastEvent(event));

    const status = statuses.find(({ userId }) => userId === user.id);
    if (status?.isConnected)
      await getResultAsync(() =>
        useRoomObject(roomId).attachMember(user.id, { ...status, status: getDetectedUserStatus(status) }),
      ).match(noop, (error) => {
        console.error("A joined member failed to attach to the room", { error, roomId, userId: user.id });
      });
  }
};
