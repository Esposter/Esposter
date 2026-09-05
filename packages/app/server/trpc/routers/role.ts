import type { MyRoomPermissions } from "#shared/models/db/role/MyRoomPermissions";
import type { RoomMemberAuthority } from "#shared/models/room/RoomMemberAuthority";
import type { Context } from "@@/server/trpc/context";
import type { RoomRoleInMessage, UserToRoomRoleInMessageWithRelations } from "@esposter/db-schema";

import { assignRoleInputSchema } from "#shared/models/db/role/AssignRoleInput";
import { createRoleInputSchema } from "#shared/models/db/role/CreateRoleInput";
import { deleteRoleInputSchema } from "#shared/models/db/role/DeleteRoleInput";
import { readMemberRolesInputSchema } from "#shared/models/db/role/ReadMemberRolesInput";
import { readMyPermissionsInputSchema } from "#shared/models/db/role/ReadMyPermissionsInput";
import { readRolesInputSchema } from "#shared/models/db/role/ReadRolesInput";
import { revokeRoleInputSchema } from "#shared/models/db/role/RevokeRoleInput";
import { updateRoleInputSchema } from "#shared/models/db/role/UpdateRoleInput";
import { checkIsManageable } from "#shared/services/room/rbac/checkIsManageable";
import { checkIsMemberManageable } from "#shared/services/room/rbac/checkIsMemberManageable";
import { roleEventEmitter } from "@@/server/services/role/events/roleEventEmitter";
import { getRoomMemberAuthority } from "@@/server/services/room/rbac/getRoomMemberAuthority";
import { getTopRolePosition } from "@@/server/services/room/rbac/getTopRolePosition";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { assertIsMember } from "@@/server/trpc/middleware/userToRoom/assertIsMember";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { getRoomEventSubscription } from "@@/server/trpc/procedure/room/getRoomEventSubscription";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { getPermissions } from "@esposter/db";
import {
  DatabaseEntityType,
  RoomPermission,
  roomRolesInMessage,
  usersToRoomRolesInMessage,
  UserToRoomRoleInMessageRelations,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

// A role may never carry a permission its author does not already hold — otherwise ManageRoles alone is a
// Path to every other permission. The room owner and an Administrator are the two who are already above it
const assertCanGrantPermissions = async (
  db: Context["db"],
  actorUserId: string,
  roomId: string,
  permissions: bigint,
  isOwner: boolean,
) => {
  if (isOwner) return;
  const actorPermissions = await getPermissions(db, actorUserId, roomId);
  const hasAdministratorPermission = Boolean(actorPermissions & RoomPermission.Administrator);
  if (!hasAdministratorPermission && (permissions & ~actorPermissions) !== 0n)
    throw new TRPCError({ code: "UNAUTHORIZED" });
};
// Granting and revoking are both two hierarchy checks, never one: the role has to be below the actor, and so
// Does the member it is being moved on or off, or a peer could be stripped through a role they outrank
const assertCanManageMemberRole = async (
  db: Context["db"],
  actor: RoomMemberAuthority,
  rolePosition: number,
  roomId: string,
  userId: string,
) => {
  if (!checkIsManageable(actor.topPosition, rolePosition, actor.isOwner)) throw new TRPCError({ code: "UNAUTHORIZED" });

  const targetAuthority = await getRoomMemberAuthority(db, userId, roomId);
  if (!checkIsMemberManageable(actor, targetAuthority)) throw new TRPCError({ code: "UNAUTHORIZED" });
};

export const roleRouter = router({
  assignRole: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    assignRoleInputSchema,
    "roomId",
  ).mutation<RoomRoleInMessage>(async ({ ctx, input: { roleId, roomId, userId } }) => {
    const actorUserId = ctx.getSessionPayload.user.id;
    const [role, actorAuthority] = await Promise.all([
      requireEntity(
        ctx.db.query.roomRolesInMessage.findFirst({
          where: { id: { eq: roleId }, roomId: { eq: roomId } },
        }),
        DatabaseEntityType.RoomRole,
        roleId,
      ),
      getRoomMemberAuthority(ctx.db, actorUserId, roomId),
      requireEntity(
        ctx.db.query.usersToRoomsInMessage.findFirst({
          columns: { userId: true },
          where: { roomId: { eq: roomId }, userId: { eq: userId } },
        }),
        DatabaseEntityType.UserToRoom,
        userId,
      ),
    ]);

    if (role.isEveryone) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoomRole, roleId);

    await assertCanManageMemberRole(ctx.db, actorAuthority, role.position, roomId, userId);

    const device = { sessionId: ctx.getSessionPayload.session.id, userId: actorUserId };
    const [userToRoomRole] = await ctx.db
      .insert(usersToRoomRolesInMessage)
      .values({ roleId, roomId, userId })
      .onConflictDoNothing()
      .returning();
    if (userToRoomRole) roleEventEmitter.emit("assignRole", [{ ...role, userId }, device]);
    return role;
  }),
  createRole: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    createRoleInputSchema,
    "roomId",
  ).mutation<RoomRoleInMessage>(async ({ ctx, input: { color, name, permissions, position, roomId } }) => {
    const actorUserId = ctx.getSessionPayload.user.id;
    const { isOwner, topPosition: actorTopPosition } = await getRoomMemberAuthority(ctx.db, actorUserId, roomId);

    if (!checkIsManageable(actorTopPosition, position, isOwner)) throw new TRPCError({ code: "UNAUTHORIZED" });

    await assertCanGrantPermissions(ctx.db, actorUserId, roomId, permissions, isOwner);

    const newRole = requireMutation(
      (await ctx.db.insert(roomRolesInMessage).values({ color, name, permissions, position, roomId }).returning())[0],
      Operation.Create,
      DatabaseEntityType.RoomRole,
      JSON.stringify({ name, roomId }),
    );

    roleEventEmitter.emit("createRole", [
      newRole,
      { sessionId: ctx.getSessionPayload.session.id, userId: actorUserId },
    ]);
    return newRole;
  }),
  deleteRole: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    deleteRoleInputSchema,
    "roomId",
  ).mutation<RoomRoleInMessage>(async ({ ctx, input: { id, roomId } }) => {
    const actorUserId = ctx.getSessionPayload.user.id;
    const [role, actorAuthority] = await Promise.all([
      requireEntity(
        ctx.db.query.roomRolesInMessage.findFirst({
          columns: { isEveryone: true, position: true },
          where: { id: { eq: id }, roomId: { eq: roomId } },
        }),
        DatabaseEntityType.RoomRole,
        id,
      ),
      getRoomMemberAuthority(ctx.db, actorUserId, roomId),
    ]);

    if (role.isEveryone) throw getInvalidOperationError(Operation.Delete, DatabaseEntityType.RoomRole, id);

    const { isOwner, topPosition: actorTopPosition } = actorAuthority;
    if (!checkIsManageable(actorTopPosition, role.position, isOwner)) throw new TRPCError({ code: "UNAUTHORIZED" });

    const deletedRole = requireMutation(
      (
        await ctx.db
          .delete(roomRolesInMessage)
          .where(and(eq(roomRolesInMessage.id, id), eq(roomRolesInMessage.roomId, roomId)))
          .returning()
      )[0],
      Operation.Delete,
      DatabaseEntityType.RoomRole,
      id,
      "NOT_FOUND",
    );

    roleEventEmitter.emit("deleteRole", [
      { id, roomId },
      { sessionId: ctx.getSessionPayload.session.id, userId: actorUserId },
    ]);
    return deletedRole;
  }),
  onAssignRole: getRoomEventSubscription(roleEventEmitter, "assignRole", ({ roomId }) => roomId),
  onCreateRole: getRoomEventSubscription(roleEventEmitter, "createRole", ({ roomId }) => roomId),
  onDeleteRole: getRoomEventSubscription(roleEventEmitter, "deleteRole", ({ roomId }) => roomId),
  onRevokeRole: getRoomEventSubscription(roleEventEmitter, "revokeRole", ({ roomId }) => roomId),
  onUpdateRole: getRoomEventSubscription(roleEventEmitter, "updateRole", ({ roomId }) => roomId),
  readMemberRoles: getMemberProcedure(readMemberRolesInputSchema, "roomId").query<
    UserToRoomRoleInMessageWithRelations[]
  >(({ ctx, input: { roomId, userIds } }) =>
    ctx.db.query.usersToRoomRolesInMessage.findMany({
      where: { roomId: { eq: roomId }, userId: { in: userIds } },
      with: UserToRoomRoleInMessageRelations,
    }),
  ),
  readMyPermissions: standardAuthedProcedure
    .input(readMyPermissionsInputSchema)
    .query<MyRoomPermissions[]>(async ({ ctx, input: { roomIds } }) => {
      const userId = ctx.getSessionPayload.user.id;
      const [rooms, permissionsMap, topRolePositionMap] = await Promise.all([
        ctx.db.query.roomsInMessage.findMany({
          columns: { id: true, userId: true },
          where: { id: { in: roomIds } },
        }),
        getPermissions(ctx.db, userId, roomIds),
        getTopRolePosition(ctx.db, userId, roomIds),
      ]);
      return roomIds.map((roomId) => ({
        isRoomOwner: rooms.find(({ id }) => id === roomId)?.userId === userId,
        permissions: permissionsMap.get(roomId) ?? 0n,
        roomId,
        topRolePosition: topRolePositionMap.get(roomId) ?? -1,
      }));
    }),
  readRoles: standardAuthedProcedure
    .input(readRolesInputSchema)
    .query<RoomRoleInMessage[]>(async ({ ctx, input: { roomIds } }) => {
      await assertIsMember(ctx.db, ctx.getSessionPayload, roomIds);
      return ctx.db.query.roomRolesInMessage.findMany({
        orderBy: { position: "desc" },
        where: { roomId: { in: roomIds } },
      });
    }),
  revokeRole: getPermissionsProcedure(RoomPermission.ManageRoles, revokeRoleInputSchema, "roomId").mutation<void>(
    async ({ ctx, input: { roleId, roomId, userId } }) => {
      const actorUserId = ctx.getSessionPayload.user.id;
      const [role, actorAuthority] = await Promise.all([
        requireEntity(
          ctx.db.query.roomRolesInMessage.findFirst({
            columns: { position: true },
            where: { id: { eq: roleId }, roomId: { eq: roomId } },
          }),
          DatabaseEntityType.RoomRole,
          roleId,
        ),
        getRoomMemberAuthority(ctx.db, actorUserId, roomId),
      ]);

      await assertCanManageMemberRole(ctx.db, actorAuthority, role.position, roomId, userId);
      // No requireMutation, unlike deleteRole: this asks for an end state — the member does not hold the role
      // — rather than for a row, and it returns nothing to be missing. Two moderators revoking at once, or one
      // Revoking against a member list that has already moved on, would otherwise be refused for arriving at
      // Exactly what they asked for. deleteRole guards because it returns the row it deleted
      await ctx.db
        .delete(usersToRoomRolesInMessage)
        .where(
          and(
            eq(usersToRoomRolesInMessage.userId, userId),
            eq(usersToRoomRolesInMessage.roomId, roomId),
            eq(usersToRoomRolesInMessage.roleId, roleId),
          ),
        );
      roleEventEmitter.emit("revokeRole", [
        { roleId, roomId, userId },
        { sessionId: ctx.getSessionPayload.session.id, userId: actorUserId },
      ]);
    },
  ),
  updateRole: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    updateRoleInputSchema,
    "roomId",
  ).mutation<RoomRoleInMessage>(async ({ ctx, input: { id, roomId, ...rest } }) => {
    const actorUserId = ctx.getSessionPayload.user.id;
    const [role, actorAuthority] = await Promise.all([
      requireEntity(
        ctx.db.query.roomRolesInMessage.findFirst({
          columns: { position: true },
          where: { id: { eq: id }, roomId: { eq: roomId } },
        }),
        DatabaseEntityType.RoomRole,
        id,
      ),
      getRoomMemberAuthority(ctx.db, actorUserId, roomId),
    ]);

    const { isOwner, topPosition: actorTopPosition } = actorAuthority;
    if (
      !checkIsManageable(actorTopPosition, role.position, isOwner) ||
      (rest.position !== undefined && !checkIsManageable(actorTopPosition, rest.position, isOwner))
    )
      throw new TRPCError({ code: "UNAUTHORIZED" });
    else if (rest.permissions !== undefined)
      await assertCanGrantPermissions(ctx.db, actorUserId, roomId, rest.permissions, isOwner);

    const updatedRole = requireMutation(
      (
        await ctx.db
          .update(roomRolesInMessage)
          .set(rest)
          .where(and(eq(roomRolesInMessage.id, id), eq(roomRolesInMessage.roomId, roomId)))
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.RoomRole,
      id,
      "NOT_FOUND",
    );
    roleEventEmitter.emit("updateRole", [
      updatedRole,
      { sessionId: ctx.getSessionPayload.session.id, userId: actorUserId },
    ]);
    return updatedRole;
  }),
});
