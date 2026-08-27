import type { RoomInMessage } from "@esposter/db-schema";

// What the caller may do in one room, bundled with the read that names it rather than fetched per surface.
export interface MyRoomPermissions {
  isRoomOwner: boolean;
  // The permission bitfield, so an absent role set reads as "no permissions" rather than as missing data
  permissions: bigint;
  roomId: RoomInMessage["id"];
  // The caller's highest role position, or -1 when they hold none — the hierarchy comparison's left-hand side
  topRolePosition: number;
}
