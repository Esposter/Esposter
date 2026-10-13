import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

// A conversation is named by its own name when it has one, and otherwise by the people in it, so the sidebar, the
// Header and the invite dialog name a conversation the same way
export const getDirectMessageName = (room: RoomInMessage, participants: Pick<PublicUser, "name">[]) =>
  room.name || participants.map(({ name }) => name).join(", ");
