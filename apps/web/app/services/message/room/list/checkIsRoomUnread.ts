import type { RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";

// A member who has never read the room has read nothing since joining it, so the room is unread until a read lands
// After its last message. A settings edit moves the room's update time and not that, so it leaves the room read
export const checkIsRoomUnread = (
  myUserToRoom: Pick<UserToRoomInMessage, "createdAt" | "lastReadAt">,
  room: Pick<RoomInMessage, "lastMessageAt">,
) => (myUserToRoom.lastReadAt ?? myUserToRoom.createdAt) < room.lastMessageAt;
