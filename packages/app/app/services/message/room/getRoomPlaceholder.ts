import type { Room, User } from "@esposter/db";

export const getRoomPlaceholder = (room: null | Room, memberMap: Map<string, User>) => {
  if (!room) return "";
  const member = memberMap.get(room.userId);
  return member ? `${member.name}'s Room` : "";
};
