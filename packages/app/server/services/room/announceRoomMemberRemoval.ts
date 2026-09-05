import type { Context } from "@@/server/trpc/context";
import type { UserToRoomInMessage } from "@esposter/db-schema";

import { createSystemRoomMessage } from "@@/server/services/message/createSystemRoomMessage";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { getResultAsync, noop } from "@esposter/shared";

// A removal a member did not choose is still a departure, so it owes the room exactly what a leave does: the
// Event every other client prunes its member list from, and the line saying who went. Left to each call site,
// A moderation kick deletes a membership row nobody is told about
export const announceRoomMemberRemoval = async (
  db: Context["db"],
  { roomId, userId }: Pick<UserToRoomInMessage, "roomId" | "userId">,
  actorUserId: string,
  sessionId: string,
  action: "banned" | "kicked",
): Promise<void> => {
  roomEventEmitter.emit("leaveRoom", { roomId, sessionId, userId });
  // Best-effort after the membership delete — the name lookup only exists to word the system message, so a
  // Failure costs the room one line, never the removal that already landed
  await getResultAsync(async () => {
    const removedMember = await db.query.users.findFirst({ columns: { name: true }, where: { id: { eq: userId } } });
    if (removedMember)
      await createSystemRoomMessage(
        roomId,
        actorUserId,
        `${removedMember.name} was ${action} from the room.`,
        sessionId,
      );
  }).match(noop, console.error);
};
