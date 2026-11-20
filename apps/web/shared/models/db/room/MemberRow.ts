import type { UserToRoomInMessage } from "@esposter/db-schema";

// A membership as a room's members read it: the columns every member of the room may see, and the version and removal the
// Overlay orders it by. The membership's own settings (its category, read marks, mentions and timeout) stay private to the
// Member who holds them, so a row a room read or an event carries is this projection and never the whole membership
export type MemberRow = Pick<UserToRoomInMessage, "deletedAt" | "displayName" | "roomId" | "userId" | "version">;
