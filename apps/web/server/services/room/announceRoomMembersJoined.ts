import type { Context } from "#server/trpc/context";
import type { MemberRow } from "#shared/models/db/room/MemberRow";
import type { PublicUser, UserEvent, UserStatusInMessage } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { notifyOnlineRoomMembers } from "#server/services/room/notifyOnlineRoomMembers";
import { getResolvedDisplayName } from "#shared/services/room/getResolvedDisplayName";
import { inJsonArray } from "@esposter/db";
import {
  getDetectedUserStatus,
  getLiveRowWhere,
  userStatusesInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

// One joiner's announcement: the room's online members and the joiner's own tabs hear it together, and an online joiner
// Is attached once they have
const announceRoomMemberJoined = async (
  { deletedAt, displayName, roomId, userId, version }: MemberRow,
  user: PublicUser,
  status: undefined | UserStatusInMessage,
) => {
  const event = {
    data: { deletedAt, displayName: getResolvedDisplayName(displayName, user.name), roomId, user, userId, version },
    type: "joinRoom",
  } satisfies UserEvent;
  await Promise.all([
    notifyOnlineRoomMembers(roomId, event),
    callUserObjects([user.id], (userObject) => userObject.broadcastEvent(event)),
  ]);
  if (!status?.isConnected) return;

  await getResultAsync(() =>
    useRoomObject(roomId).attachMember(user.id, { ...status, status: getDetectedUserStatus(status) }),
  ).match(noop, (error) => {
    console.error("A joined member failed to attach to the room", { error, roomId, userId: user.id });
  });
};
// A join is announced one member at a time: the room's online members hear of it, then the joiner's own tabs do.
// The joiner is attached to the room if they are online, so the joins after theirs reach them. A joiner is attached
// Only after the fan-out, so the fan-out never sends their own join to them twice
export const announceRoomMembersJoined = async (
  db: Context["db"],
  roomId: string,
  users: PublicUser[],
): Promise<void> => {
  if (users.length === 0) return;

  const userIds = users.map(({ id }) => id);
  const [memberships, statuses] = await Promise.all([
    db
      .select({
        deletedAt: usersToRoomsInMessage.deletedAt,
        displayName: usersToRoomsInMessage.displayName,
        roomId: usersToRoomsInMessage.roomId,
        userId: usersToRoomsInMessage.userId,
        version: usersToRoomsInMessage.version,
      })
      .from(usersToRoomsInMessage)
      .where(
        and(
          eq(usersToRoomsInMessage.roomId, roomId),
          inJsonArray(usersToRoomsInMessage.userId, userIds),
          getLiveRowWhere(usersToRoomsInMessage),
        ),
      ),
    db.select().from(userStatusesInMessage).where(inJsonArray(userStatusesInMessage.userId, userIds)),
  ]);
  for (const user of users) {
    const membership = memberships.find(({ userId }) => userId === user.id);
    // A user who holds no live membership of the room joined nothing, so there is no row to announce
    if (!membership) continue;

    const status = statuses.find(({ userId }) => userId === user.id);
    // oxlint-disable-next-line no-await-in-loop -- Each step reads the last: a joiner attached here hears the joins
    await announceRoomMemberJoined(membership, user, status);
  }
};
