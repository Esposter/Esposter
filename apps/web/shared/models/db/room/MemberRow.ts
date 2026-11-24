import type { UserToRoomInMessage } from "@esposter/db-schema";

// A membership as a room's members read it: the columns every member of the room may see.
// That includes the version and removal the overlay orders it by.
// Its own settings (category, read marks, mentions and timeout) stay private to the member who holds them.
// So a row a room read or an event carries is this projection, and never the whole membership
export type MemberRow = Pick<UserToRoomInMessage, "deletedAt" | "displayName" | "roomId" | "userId" | "version">;
