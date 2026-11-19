import type { RoomRoleInMessage } from "@esposter/db-schema";

// The implicit @everyone role is never assigned, listed for assignment, mentioned or deleted, so every surface that
// Offers a room's roles asks this one question rather than writing the `isEveryone` test of its own
export const checkIsAssignableRole = (role: RoomRoleInMessage) => !role.isEveryone;
