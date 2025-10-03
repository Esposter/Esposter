import type { Room } from "#shared/db/schema/rooms";
import type { User } from "#shared/db/schema/users";

import { getRoomPlaceholder } from "@/services/message/room/getRoomPlaceholder";

export const getRoomName = (room: null | Room, memberMap: Map<string, User>) => {
  if (!room) return "";
  const placeholder = getRoomPlaceholder(room, memberMap);
  return room.name || placeholder;
};
