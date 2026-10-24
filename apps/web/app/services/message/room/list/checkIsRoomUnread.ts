import type { UserToRoomInMessage } from "@esposter/db-schema";

// A member who has never read the room has read nothing since joining it, so the room is unread until a read lands
// After its last update
export const checkIsRoomUnread = (
  myUserToRoom: Pick<UserToRoomInMessage, "createdAt" | "lastReadAt">,
  roomUpdatedAt: Date,
) => (myUserToRoom.lastReadAt ?? myUserToRoom.createdAt) < roomUpdatedAt;
