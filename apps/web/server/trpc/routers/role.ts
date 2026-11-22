import type { MyRoomPermissions } from "#shared/models/db/role/MyRoomPermissions";
import type {
  RoomMemberPermissionInMessage,
  RoomRoleInMessage,
  UserToRoomRoleInMessage,
  UserToRoomRoleInMessageWithRelations,
} from "@esposter/db-schema";

import { inRoom } from "#server/services/db/inRoom";
import { assertIsMember } from "#server/services/room/assertIsMember";
import { assertCanGrantPermissions } from "#server/services/room/rbac/assertCanGrantPermissions";
import { assertCanManageMemberRole } from "#server/services/room/rbac/assertCanManageMemberRole";
import { assertCanManageRole } from "#server/services/room/rbac/assertCanManageRole";
import { assertIsManageable } from "#server/services/room/rbac/assertIsManageable";
import { checkIsRoomOwner } from "#server/services/room/rbac/checkIsRoomOwner";
import { getRoomMemberAuthority } from "#server/services/room/rbac/getRoomMemberAuthority";
import { getTopRolePositionByRoomId } from "#server/services/room/rbac/getTopRolePositionByRoomId";
import { readRoleWithAuthority } from "#server/services/room/rbac/readRoleWithAuthority";
import { setMemberPermissionOverride } from "#server/services/room/rbac/setMemberPermissionOverride";
import { requireUserToRoom } from "#server/services/room/requireUserToRoom";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
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
import { getPermissionsByRoomId, inJsonArray } from "@esposter/db";
import {
  DatabaseEntityType,
  getLiveRowWhere,
  revokeRoleInputSchema,
  roomMemberPermissionsInMessage,
  RoomPermission,
  roomRolesInMessage,
  usersToRoomRolesInMessage,
  UserToRoomRoleInMessageRelations,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq, isNotNull, sql } from "drizzle-orm";

export const roleRouter = router({
  // A role a revocation or a deletion left as a tombstone is revived by the insert's conflict branch, and a live assignment is
  // Already the answer, so it is read back rather than returned by the write. Either way the answer names the row it holds
  assignRole: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    assignRoleInputSchema,
    "roomId",
  ).mutation<UserToRoomRoleInMessageWithRelations>(async ({ ctx, input: { roleId, roomId, userId } }) => {
    const actorUserId = ctx.user.id;
    const [role, actorAuthority] = await Promise.all([
      requireEntity(
        ctx.db.query.roomRolesInMessage.findFirst({
          where: { id: { eq: roleId }, RAW: getLiveRowWhere, roomId: { eq: roomId } },
        }),
        DatabaseEntityType.RoomRole,
        roleId,
      ),
      getRoomMemberAuthority(ctx.db, actorUserId, roomId),
      requireUserToRoom(ctx.db, roomId, userId),
    ]);

    if (role.isEveryone) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoomRole, roleId);

    await assertCanManageMemberRole(ctx.db, actorAuthority, role.position, roomId, userId);

    const [assigned] = await ctx.db
      .insert(usersToRoomRolesInMessage)
      .values({ roleId, roomId, userId })
      .onConflictDoUpdate({
        set: { deletedAt: null },
        setWhere: isNotNull(usersToRoomRolesInMessage.deletedAt),
        target: [usersToRoomRolesInMessage.userId, usersToRoomRolesInMessage.roomId, usersToRoomRolesInMessage.roleId],
      })
      .returning();
    const memberRole =
      assigned ??
      (await requireEntity(
        ctx.db.query.usersToRoomRolesInMessage.findFirst({ where: { RAW: getLiveRowWhere, roleId, roomId, userId } }),
        DatabaseEntityType.UserToRoomRole,
        roleId,
      ));
    return { ...memberRole, role };
  }),
  // A role a deletion left as a tombstone is revived by a create that names its id, and only a create in the same room
  // May revive it, so the set-where names the room too
  createRole: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    createRoleInputSchema,
    "roomId",
  ).mutation<RoomRoleInMessage>(async ({ ctx, input: { color, id, name, permissions, position, roomId } }) => {
    const actorUserId = ctx.user.id;
    const actorAuthority = await getRoomMemberAuthority(ctx.db, actorUserId, roomId);

    assertCanManageRole(actorAuthority, position);
    await assertCanGrantPermissions(ctx.db, actorUserId, roomId, permissions, actorAuthority.isOwner);

    const newRole = requireMutation(
      (
        await ctx.db
          .insert(roomRolesInMessage)
          .values({ color, id, name, permissions, position, roomId })
          .onConflictDoUpdate({
            set: {
              color: sql`excluded.color`,
              createdAt: sql`excluded.createdAt`,
              deletedAt: null,
              name: sql`excluded.name`,
              permissions: sql`excluded.permissions`,
              position: sql`excluded.position`,
            },
            setWhere: sql`${isNotNull(roomRolesInMessage.deletedAt)} and ${eq(roomRolesInMessage.roomId, roomId)}`,
            target: roomRolesInMessage.id,
          })
          .returning()
      )[0],
      Operation.Create,
      DatabaseEntityType.RoomRole,
      JSON.stringify({ name, roomId }),
    );

    return newRole;
  }),
  // A member with no live override is the answer whether or not one was there to remove, so this asks for an end state
  deleteMemberPermissionOverride: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    deleteMemberPermissionOverrideInputSchema,
    "roomId",
  ).mutation<RoomMemberPermissionInMessage[]>(async ({ ctx, input: { roomId, userId } }) => {
    await assertIsManageable(ctx.db, ctx.user.id, userId, roomId);
    return ctx.db
      .update(roomMemberPermissionsInMessage)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(roomMemberPermissionsInMessage.roomId, roomId),
          eq(roomMemberPermissionsInMessage.userId, userId),
          getLiveRowWhere(roomMemberPermissionsInMessage),
        ),
      )
      .returning();
  }),
  // The role is deleted as a tombstone, and so are the assignments it held, in one batch. A revival of the role under the
  // Same id then starts with no member holding it, rather than handing the old holders back
  deleteRole: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    deleteRoleInputSchema,
    "roomId",
  ).mutation<RoomRoleInMessage>(async ({ ctx, input: { id, roomId } }) => {
    const actorUserId = ctx.user.id;
    const [role, actorAuthority] = await readRoleWithAuthority(ctx.db, actorUserId, id, roomId);

    if (role.isEveryone) throw getInvalidOperationError(Operation.Delete, DatabaseEntityType.RoomRole, id);

    assertCanManageRole(actorAuthority, role.position);

    const [, deletedRoles] = await ctx.db.batch([
      ctx.db
        .update(usersToRoomRolesInMessage)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(usersToRoomRolesInMessage.roleId, id),
            eq(usersToRoomRolesInMessage.roomId, roomId),
            getLiveRowWhere(usersToRoomRolesInMessage),
          ),
        ),
      ctx.db
        .update(roomRolesInMessage)
        .set({ deletedAt: new Date() })
        .where(and(inRoom(roomRolesInMessage, id, roomId), getLiveRowWhere(roomRolesInMessage)))
        .returning(),
    ]);
    return requireMutation(deletedRoles[0], Operation.Delete, DatabaseEntityType.RoomRole, id, "NOT_FOUND");
  }),
  // Visible to the room as readMemberRoles is: a role assignment is already public to every member, and an override
  // Is the same kind of fact about the same member. Tombstones come back too, so a client holding an override learns it
  // Was removed
  readMemberPermissionOverrides: getMemberProcedure(readMemberPermissionOverridesInputSchema, "roomId").query<
    RoomMemberPermissionInMessage[]
  >(({ ctx, input: { roomId } }) =>
    ctx.db.query.roomMemberPermissionsInMessage.findMany({ where: { roomId: { eq: roomId } } }),
  ),
  // Tombstoned assignments come back with their roles, so a client holding one learns the revocation
  readMemberRoles: getMemberProcedure(readMemberRolesInputSchema, "roomId").query<
    UserToRoomRoleInMessageWithRelations[]
  >(({ ctx, input: { roomId, userIds } }) =>
    ctx.db.query.usersToRoomRolesInMessage.findMany({
      where: { RAW: (userToRoomRole) => inJsonArray(userToRoomRole.userId, userIds), roomId: { eq: roomId } },
      with: UserToRoomRoleInMessageRelations,
    }),
  ),
  readMyPermissions: standardAuthedProcedure
    .input(readMyPermissionsInputSchema)
    .query<MyRoomPermissions[]>(async ({ ctx, input: { roomIds } }) => {
      const userId = ctx.user.id;
      const [rooms, permissionsMap, topRolePositionMap] = await Promise.all([
        ctx.db.query.roomsInMessage.findMany({
          columns: { id: true, userId: true },
          where: { RAW: (room) => inJsonArray(room.id, roomIds) },
        }),
        getPermissionsByRoomId(ctx.db, userId, roomIds),
        getTopRolePositionByRoomId(ctx.db, userId, roomIds),
      ]);
      return roomIds.map((roomId) => ({
        isRoomOwner: checkIsRoomOwner(
          rooms.find(({ id }) => id === roomId),
          userId,
        ),
        permissions: permissionsMap.get(roomId) ?? 0n,
        roomId,
        topRolePosition: topRolePositionMap.get(roomId) ?? -1,
      }));
    }),
  // Tombstoned roles come back too, so a client holding a role learns its deletion from the read
  readRoles: standardAuthedProcedure
    .input(readRolesInputSchema)
    .query<RoomRoleInMessage[]>(async ({ ctx, input: { roomIds } }) => {
      await assertIsMember(ctx, roomIds);
      return ctx.db.query.roomRolesInMessage.findMany({
        orderBy: { position: "desc" },
        where: { RAW: (role) => inJsonArray(role.roomId, roomIds) },
      });
    }),
  // No requireMutation, unlike deleteRole: this asks for an end state — the member does not hold the role — rather than for
  // A row, and it returns nothing to be missing. Two moderators revoking at once, or one revoking against a member list
  // That has already moved on, would otherwise be refused for arriving at exactly what they asked for. The assignments it
  // Tombstones are returned, which may be none
  revokeRole: getPermissionsProcedure(RoomPermission.ManageRoles, revokeRoleInputSchema, "roomId").mutation<
    UserToRoomRoleInMessage[]
  >(async ({ ctx, input: { roleId, roomId, userId } }) => {
    const actorUserId = ctx.user.id;
    const [role, actorAuthority] = await readRoleWithAuthority(ctx.db, actorUserId, roleId, roomId);

    await assertCanManageMemberRole(ctx.db, actorAuthority, role.position, roomId, userId);
    return ctx.db
      .update(usersToRoomRolesInMessage)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(usersToRoomRolesInMessage.userId, userId),
          eq(usersToRoomRolesInMessage.roomId, roomId),
          eq(usersToRoomRolesInMessage.roleId, roleId),
          getLiveRowWhere(usersToRoomRolesInMessage),
        ),
      )
      .returning();
  }),
  updateRole: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    updateRoleInputSchema,
    "roomId",
  ).mutation<RoomRoleInMessage>(async ({ ctx, input: { id, roomId, ...rest } }) => {
    const actorUserId = ctx.user.id;
    const [role, actorAuthority] = await readRoleWithAuthority(ctx.db, actorUserId, id, roomId);

    // The role as it stands and the position it is moved to must both be below the actor, and the owner clears both
    assertCanManageRole(actorAuthority, role.position);
    if (rest.position !== undefined) assertCanManageRole(actorAuthority, rest.position);
    if (rest.permissions !== undefined)
      await assertCanGrantPermissions(ctx.db, actorUserId, roomId, rest.permissions, actorAuthority.isOwner);

    const updatedRole = requireMutation(
      (
        await ctx.db
          .update(roomRolesInMessage)
          .set(rest)
          .where(and(inRoom(roomRolesInMessage, id, roomId), getLiveRowWhere(roomRolesInMessage)))
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.RoomRole,
      id,
      "NOT_FOUND",
    );
    return updatedRole;
  }),
  upsertMemberPermissionOverride: getPermissionsProcedure(
    RoomPermission.ManageRoles,
    upsertMemberPermissionOverrideInputSchema,
    "roomId",
  ).mutation<RoomMemberPermissionInMessage[]>(async ({ ctx, input: { allow, deny, inherit, roomId, userId } }) => {
    const actorUserId = ctx.user.id;
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
    return setMemberPermissionOverride(ctx.db, { allow, deny, inherit, roomId, userId });
  }),
});
