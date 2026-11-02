import type { RoomMemberRemovalAction } from "#server/models/room/RoomMemberRemovalAction";
import type { Context } from "#server/trpc/context";
import type { UserToRoomInMessage } from "@esposter/db-schema";

import { removeUserFromRoomGroup } from "#server/services/azure/webPubSub/removeUserFromRoomGroup";
import { createSystemRoomMessage } from "#server/services/message/createSystemRoomMessage";
import { roomEventEmitter } from "#server/services/message/events/roomEventEmitter";
import { getResultAsync, noop } from "@esposter/shared";

// A removal a member did not choose is still a departure, so it owes the room exactly what a leave does: the
// `leaveRoom` event every other client prunes its member list from, and the line saying who went. Left to each
// Call site, a moderation kick deletes a membership row nobody is told about
export const announceRoomMemberRemoval = async (
  db: Context["db"],
  { roomId, userId }: Pick<UserToRoomInMessage, "roomId" | "userId">,
  actorUserId: string,
  sessionId: string,
  action: RoomMemberRemovalAction,
): Promise<void> => {
  roomEventEmitter.emit("leaveRoom", { roomId, sessionId, userId });
  // Out of the room's group before the line below is sent, so the removed member does not receive the line
  await removeUserFromRoomGroup(db, roomId, userId);
  // Best-effort after the membership delete — the name lookup only exists to word the system message, so a
  // Failure costs the room one line, never the removal that already landed
  await getResultAsync(async () => {
    const removedMember = await db.query.usersInAuth.findFirst({
      columns: { name: true },
      where: { id: { eq: userId } },
    });
    if (removedMember)
      await createSystemRoomMessage(
        roomId,
        actorUserId,
        `${removedMember.name} was ${action} from the room.`,
        sessionId,
      ).match(noop, console.error);
  }).match(noop, console.error);
};
