import type { Database } from "@esposter/db-schema";

import { getRoomMemberAuthority } from "@@/server/services/room/rbac/getRoomMemberAuthority";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { DatabaseEntityType } from "@esposter/db-schema";

// Every role mutation asks the same two questions — is this role the room's, and what may the actor do to it —
// And neither read depends on the other, so they go out together. Resolved as a guard, so a role that is not the
// Room's fails before any hierarchy comparison is made against it. `isEveryone` rides along for the callers that
// Refuse the default role outright; a boolean column costs less than a second shape of this read
export const readRoleWithAuthority = (db: Database, actorUserId: string, roleId: string, roomId: string) =>
  Promise.all([
    requireEntity(
      db.query.roomRolesInMessage.findFirst({
        columns: { isEveryone: true, position: true },
        where: { id: { eq: roleId }, roomId: { eq: roomId } },
      }),
      DatabaseEntityType.RoomRole,
      roleId,
    ),
    getRoomMemberAuthority(db, actorUserId, roomId),
  ]);
