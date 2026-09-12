import type { RoomRoleInMessage } from "@esposter/db-schema";

export interface MemberGroup<TMember> {
  members: TMember[];
  role?: RoomRoleInMessage;
}
