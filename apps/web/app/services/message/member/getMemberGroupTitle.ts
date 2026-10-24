import type { RoomRoleInMessage } from "@esposter/db-schema";

// A group is headed by its role's name and how many hold it, and a group whose count is not known is headed by its
// Name alone
export const getMemberGroupTitle = (role: RoomRoleInMessage | undefined, groupMemberCount: number | undefined) =>
  `${role?.name ?? "Members"}${groupMemberCount === undefined ? "" : ` — ${groupMemberCount}`}`;
