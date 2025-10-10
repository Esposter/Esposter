import type { Room, User } from "@esposter/db-schema";

import { getRoomPlaceholder } from "@/services/message/room/getRoomPlaceholder";

export const getRoomName = (room: null | Room, memberMap: Map<string, User>) => {
  if (!room) return "";
  const placeholder = getRoomPlaceholder(room, memberMap);
  return room.name || placeholder;
};
