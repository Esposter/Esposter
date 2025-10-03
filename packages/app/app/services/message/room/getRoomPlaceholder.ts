import type { Room } from "#shared/db/schema/rooms";
import type { User } from "#shared/db/schema/users";

export const getRoomPlaceholder = (room: null | Room, memberMap: Map<string, User>) => {
  if (!room) return "";
  const member = memberMap.get(room.userId);
  return member ? `${member.name}'s Room` : "";
};
