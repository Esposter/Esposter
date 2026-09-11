import type { Context } from "@@/server/trpc/context";

import { getPermissions } from "@esposter/db";
import { RoomPermission } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";

// A role may never carry a permission its author does not already hold — otherwise ManageRoles alone is a
// Path to every other permission. The room owner and an Administrator are the two who are already above it
export const assertCanGrantPermissions = async (
  db: Context["db"],
  actorUserId: string,
  roomId: string,
  permissions: bigint,
  isOwner: boolean,
): Promise<void> => {
  if (isOwner) return;
  const actorPermissions = await getPermissions(db, actorUserId, roomId);
  const hasAdministratorPermission = Boolean(actorPermissions & RoomPermission.Administrator);
  if (!hasAdministratorPermission && (permissions & ~actorPermissions) !== 0n)
    throw new TRPCError({ code: "UNAUTHORIZED" });
};
