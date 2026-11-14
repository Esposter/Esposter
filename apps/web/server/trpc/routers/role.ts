import type { MemberPermissionOverride } from "#shared/models/db/role/MemberPermissionOverride";
import type { MemberPermissionOverrideEntry } from "#shared/models/db/role/MemberPermissionOverrideEntry";
import type { MyRoomPermissions } from "#shared/models/db/role/MyRoomPermissions";
import type { RoomRoleInMessage, UserToRoomRoleInMessageWithRelations } from "@esposter/db-schema";

import { inRoom } from "#server/services/db/inRoom";
import { getRoomActor } from "#server/services/realtime/getRoomActor";
import { getRoleEventData } from "#server/services/role/getRoleEventData";
import { assertIsMember } from "#server/services/room/assertIsMember";
import { broadcastRoomEvent } from "#server/services/room/broadcastRoomEvent";
import { assertCanGrantPermissions } from "#server/services/room/rbac/assertCanGrantPermissions";
import { assertCanManageMemberRole } from "#server/services/room/rbac/assertCanManageMemberRole";
import { assertIsManageable } from "#server/services/room/rbac/assertIsManageable";
import { getRoomMemberAuthority } from "#server/services/room/rbac/getRoomMemberAuthority";
import { getTopRolePosition } from "#server/services/room/rbac/getTopRolePosition";
import { readRoleWithAuthority } from "#server/services/room/rbac/readRoleWithAuthority";
import { setMemberPermissionOverride } from "#server/services/room/rbac/setMemberPermissionOverride";
import { requireUserToRoom } from "#server/services/room/requireUserToRoom";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "#server/trpc/procedure/room/getPermissionsProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { assignRoleInputSchema } from "#shared/models/db/role/AssignRoleInput";
import { createRoleInputSchema } from "#shared/models/db/role/CreateRoleInput";
import { deleteMemberPermissionOverrideInputSchema } from "#shared/models/db/role/DeleteMemberPermissionOverrideInput";
import { deleteRoleInputSchema } from "#shared/models/db/role/DeleteRoleInput";
import { readMemberPermissionOverridesInputSchema } from "#shared/models/db/role/ReadMemberPermissionOverridesInput";
import { readMemberRolesInputSchema } from "#shared/models/db/role/ReadMemberRolesInput";
import { readMyPermissionsInputSchema } from "#shared/models/db/role/ReadMyPermissionsInput";
import { readRolesInputSchema } from "#shared/models/db/role/ReadRolesInput";
import { updateRoleInputSchema } from "#shared/models/db/role/UpdateRoleInput";
import { upsertMemberPermissionOverrideInputSchema } from "#shared/models/db/role/UpsertMemberPermissionOverrideInput";
import { checkIsManageable } from "#shared/services/room/rbac/checkIsManageable";
import { getPermissions } from "@esposter/db";
import {
  DatabaseEntityType,
  revokeRoleInputSchema,
  roomMemberPermissionsInMessage,
  RoomPermission,
  roomRolesInMessage,
  usersToRoomRolesInMessage,
  UserToRoomRoleInMessageRelations,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const roleRouter = router({
  assignRole: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    assignRoleInputSchema,
    "roomId",
  ).mutation<RoomRoleInMessage>(async ({ ctx, input: { roleId, roomId, userId } }) => {
    const actorUserId = ctx.getSessionPayload.user.id;
    const [role, actorAuthority] = await Promise.all([
      requireEntity(
        ctx.db.query.roomRolesInMessage.findFirst({ where: { id: { eq: roleId }, roomId: { eq: roomId } } }),
        DatabaseEntityType.RoomRole,
        roleId,
      ),
      getRoomMemberAuthority(ctx.db, actorUserId, roomId),
      requireUserToRoom(ctx.db, roomId, userId),
    ]);

    if (role.isEveryone) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoomRole, roleId);

    await assertCanManageMemberRole(ctx.db, actorAuthority, role.position, roomId, userId);

    const [userToRoomRole] = await ctx.db
      .insert(usersToRoomRolesInMessage)
      .values({ roleId, roomId, userId })
      .onConflictDoNothing()
      .returning();
    if (userToRoomRole) {
      const actor = getRoomActor(ctx.getSessionPayload, ctx.headers);
      const roleData = getRoleEventData(role);
      await broadcastRoomEvent(roomId, { data: { ...roleData, userId }, type: "assignRole" }, actor);
    }
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

    const actor = getRoomActor(ctx.getSessionPayload, ctx.headers);
    const roleData = getRoleEventData(newRole);
    await broadcastRoomEvent(roomId, { data: roleData, type: "createRole" }, actor);
    return newRole;
  }),
  deleteMemberPermissionOverride: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    deleteMemberPermissionOverrideInputSchema,
    "roomId",
  ).mutation<void>(async ({ ctx, input: { roomId, userId } }) => {
    await assertIsManageable(ctx.db, ctx.getSessionPayload.user.id, userId, roomId);
    // An end state, like revokeRole: a member with no override is the answer whether or not one was there to remove
    await ctx.db
      .delete(roomMemberPermissionsInMessage)
      .where(and(eq(roomMemberPermissionsInMessage.roomId, roomId), eq(roomMemberPermissionsInMessage.userId, userId)));
    const actor = getRoomActor(ctx.getSessionPayload, ctx.headers);
    await broadcastRoomEvent(
      roomId,
      { data: { allow: "0", deny: "0", roomId, userId }, type: "updateMemberPermissionOverride" },
      actor,
    );
  }),
  deleteRole: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    deleteRoleInputSchema,
    "roomId",
  ).mutation<RoomRoleInMessage>(async ({ ctx, input: { id, roomId } }) => {
    const actorUserId = ctx.getSessionPayload.user.id;
    const [role, actorAuthority] = await readRoleWithAuthority(ctx.db, actorUserId, id, roomId);

    if (role.isEveryone) throw getInvalidOperationError(Operation.Delete, DatabaseEntityType.RoomRole, id);

    const { isOwner, topPosition: actorTopPosition } = actorAuthority;
    if (!checkIsManageable(actorTopPosition, role.position, isOwner)) throw new TRPCError({ code: "UNAUTHORIZED" });

    const deletedRole = requireMutation(
      (
        await ctx.db
          .delete(roomRolesInMessage)
          .where(inRoom(roomRolesInMessage, id, roomId))
          .returning()
      )[0],
      Operation.Delete,
      DatabaseEntityType.RoomRole,
      id,
      "NOT_FOUND",
    );

    const actor = getRoomActor(ctx.getSessionPayload, ctx.headers);
    await broadcastRoomEvent(roomId, { data: { id, roomId }, type: "deleteRole" }, actor);
    return deletedRole;
  }),
  // Visible to the room as readMemberRoles is: a role assignment is already public to every member, and an override
  // Is the same kind of fact about the same member
  readMemberPermissionOverrides: getMemberProcedure(readMemberPermissionOverridesInputSchema, "roomId").query<
    MemberPermissionOverrideEntry[]
  >(({ ctx, input: { roomId } }) =>
    ctx.db.query.roomMemberPermissionsInMessage.findMany({
      columns: { allow: true, deny: true, userId: true },
      where: { roomId: { eq: roomId } },
    }),
  ),
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
        ctx.db.query.roomsInMessage.findMany({ columns: { id: true, userId: true }, where: { id: { in: roomIds } } }),
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
      const [role, actorAuthority] = await readRoleWithAuthority(ctx.db, actorUserId, roleId, roomId);

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
      const actor = getRoomActor(ctx.getSessionPayload, ctx.headers);
      await broadcastRoomEvent(roomId, { data: { roleId, roomId, userId }, type: "revokeRole" }, actor);
    },
  ),
  updateRole: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    updateRoleInputSchema,
    "roomId",
  ).mutation<RoomRoleInMessage>(async ({ ctx, input: { id, roomId, ...rest } }) => {
    const actorUserId = ctx.getSessionPayload.user.id;
    const [role, actorAuthority] = await readRoleWithAuthority(ctx.db, actorUserId, id, roomId);

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
          .where(inRoom(roomRolesInMessage, id, roomId))
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.RoomRole,
      id,
      "NOT_FOUND",
    );
    const actor = getRoomActor(ctx.getSessionPayload, ctx.headers);
    const roleData = getRoleEventData(updatedRole);
    await broadcastRoomEvent(roomId, { data: roleData, type: "updateRole" }, actor);
    return updatedRole;
  }),
  upsertMemberPermissionOverride: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    upsertMemberPermissionOverrideInputSchema,
    "roomId",
  ).mutation<MemberPermissionOverride>(async ({ ctx, input: { allow, deny, inherit, roomId, userId } }) => {
    const actorUserId = ctx.getSessionPayload.user.id;
    // A bit set in both would be a state nothing designed, and the Administrator bit is answered from the roles
    // Alone, so neither may be written as an override
    const overriddenPermissions = allow | deny;
    if (allow & deny || overriddenPermissions & RoomPermission.Administrator)
      throw getInvalidOperationError(
        Operation.Update,
        DatabaseEntityType.UserToRoom,
        JSON.stringify({ allow: allow.toString(), deny: deny.toString() }),
      );

    const [{ isOwner }] = await Promise.all([
      getRoomMemberAuthority(ctx.db, actorUserId, roomId),
      requireUserToRoom(ctx.db, roomId, userId),
      assertIsManageable(ctx.db, actorUserId, userId, roomId),
    ]);
    // A member may give an override only what they hold themselves, as a role may carry only what its author holds
    await assertCanGrantPermissions(ctx.db, actorUserId, roomId, allow, isOwner);
    const override = await setMemberPermissionOverride(ctx.db, { allow, deny, inherit, roomId, userId });
    const actor = getRoomActor(ctx.getSessionPayload, ctx.headers);
    await broadcastRoomEvent(
      roomId,
      {
        data: { allow: override.allow.toString(), deny: override.deny.toString(), roomId, userId },
        type: "updateMemberPermissionOverride",
      },
      actor,
    );
    return override;
  }),
});
