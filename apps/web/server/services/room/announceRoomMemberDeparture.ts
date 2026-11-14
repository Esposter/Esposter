import type { UserToRoomInMessage } from "@esposter/db-schema";

import { roomEventEmitter } from "#server/services/message/events/roomEventEmitter";

// Every departure from a room, a leave or a removal, announces `leaveRoom`: the leaver's own subscriptions to the room
// end on it (`onWhileMember`), and every other client prunes the member from its list
export const announceRoomMemberDeparture = (
  { roomId, userId }: Pick<UserToRoomInMessage, "roomId" | "userId">,
  sessionId: string,
): void => {
  roomEventEmitter.emit("leaveRoom", { roomId, sessionId, userId });
};
