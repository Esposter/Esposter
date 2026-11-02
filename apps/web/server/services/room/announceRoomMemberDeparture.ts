import type { Context } from "#server/trpc/context";
import type { UserToRoomInMessage } from "@esposter/db-schema";

import { removeUserFromRoomGroup } from "#server/services/azure/webPubSub/removeUserFromRoomGroup";
import { roomEventEmitter } from "#server/services/message/events/roomEventEmitter";
import { noop } from "@esposter/shared";

// Every departure from a room, a leave or a removal, takes the member out of the room's group before `leaveRoom` goes
// Out, so the leaver's connections are not in it when the event is sent. Best-effort: a failed removal is logged, and
// The departure stands
export const announceRoomMemberDeparture = async (
  db: Context["db"],
  { roomId, userId }: Pick<UserToRoomInMessage, "roomId" | "userId">,
  sessionId: string,
): Promise<void> => {
  await removeUserFromRoomGroup(db, roomId, userId).match(noop, console.error);
  roomEventEmitter.emit("leaveRoom", { roomId, sessionId, userId });
};
