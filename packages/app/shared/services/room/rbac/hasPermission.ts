import { RoomPermission } from "@esposter/db-schema";

export const hasPermission = (permissions: bigint, permission: bigint, isRoomOwner: boolean): boolean =>
  isRoomOwner || Boolean(permissions & RoomPermission.Administrator) || Boolean(permissions & permission);
