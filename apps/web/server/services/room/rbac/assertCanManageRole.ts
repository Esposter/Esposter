import type { RoomMemberAuthority } from "#shared/models/room/RoomMemberAuthority";

import { checkIsManageable } from "#shared/services/room/rbac/checkIsManageable";
import { TRPCError } from "@trpc/server";

// A role is created, edited or deleted only by an actor who outranks its position, and the owner outranks every role
export const assertCanManageRole = (actor: RoomMemberAuthority, rolePosition: number): void => {
  if (!checkIsManageable(actor.topPosition, rolePosition, actor.isOwner)) throw new TRPCError({ code: "UNAUTHORIZED" });
};
