import type { RoomMemberAuthority } from "#shared/models/room/RoomMemberAuthority";
import type { Context } from "@@/server/trpc/context";

import { checkIsManageable } from "#shared/services/room/rbac/checkIsManageable";
import { checkIsMemberManageable } from "#shared/services/room/rbac/checkIsMemberManageable";
import { getRoomMemberAuthority } from "@@/server/services/room/rbac/getRoomMemberAuthority";
import { TRPCError } from "@trpc/server";

// Granting and revoking are both two hierarchy checks, never one: the role has to be below the actor, and so
// Does the member it is being moved on or off, or a peer could be stripped through a role they outrank
export const assertCanManageMemberRole = async (
  db: Context["db"],
  actor: RoomMemberAuthority,
  rolePosition: number,
  roomId: string,
  userId: string,
): Promise<void> => {
  if (!checkIsManageable(actor.topPosition, rolePosition, actor.isOwner)) throw new TRPCError({ code: "UNAUTHORIZED" });

  const targetAuthority = await getRoomMemberAuthority(db, userId, roomId);
  if (!checkIsMemberManageable(actor, targetAuthority)) throw new TRPCError({ code: "UNAUTHORIZED" });
};
