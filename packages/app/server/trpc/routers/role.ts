import type { RoomRole, UserToRoomRoleWithRelations } from "@esposter/db-schema";

import { assignRoleInputSchema } from "#shared/models/db/role/AssignRoleInput";
import { createRoleInputSchema } from "#shared/models/db/role/CreateRoleInput";
import { deleteRoleInputSchema } from "#shared/models/db/role/DeleteRoleInput";
import { readMemberRolesInputSchema } from "#shared/models/db/role/ReadMemberRolesInput";
import { readMyPermissionsInputSchema } from "#shared/models/db/role/ReadMyPermissionsInput";
import { readRolesInputSchema } from "#shared/models/db/role/ReadRolesInput";
import { revokeRoleInputSchema } from "#shared/models/db/role/RevokeRoleInput";
import { updateRoleInputSchema } from "#shared/models/db/role/UpdateRoleInput";
import { isManageable } from "#shared/services/room/rbac/isManageable";
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { on } from "@@/server/services/events/on";
import { roleEventEmitter } from "@@/server/services/message/events/roleEventEmitter";
import { getActorContext } from "@@/server/services/room/rbac/getActorContext";
import { getPermissions } from "@@/server/services/room/rbac/getPermissions";
import { getTopRolePosition } from "@@/server/services/room/rbac/getTopRolePosition";
import { router } from "@@/server/trpc";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import {
  DatabaseEntityType,
  RoomPermission,
  roomRoles,
  selectRoomSchema,
  usersToRoomRoles,
  UserToRoomRoleRelations,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const onRoleInputSchema = z.object({ roomId: selectRoomSchema.shape.id });

export const roleRouter = router({
  assignRole: getPermissionsProcedure(RoomPermission.ManageRoles, assignRoleInputSchema, "roomId").mutation<RoomRole>(
    async ({ ctx, input: { roleId, roomId, userId } }) => {
      const actorUserId = ctx.getSessionPayload.user.id;
      const [role, member, actorContext] = await Promise.all([
        ctx.db.query.roomRoles.findFirst({
          where: (roomRoles, { and, eq }) => and(eq(roomRoles.id, roleId), eq(roomRoles.roomId, roomId)),
        }),
        ctx.db.query.usersToRooms.findFirst({
          columns: { userId: true },
          where: (usersToRooms, { and, eq }) => and(eq(usersToRooms.userId, userId), eq(usersToRooms.roomId, roomId)),
        }),
        getActorContext(ctx.db, actorUserId, roomId),
      ]);

      if (!role)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomRole, roleId).message,
        });
      else if (role.isEveryone)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoomRole, roleId).message,
        });
      else if (!member)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.UserToRoom, userId).message,
        });

      const { actorTopPosition, isOwner } = actorContext;
      if (!isManageable(actorTopPosition, role.position, isOwner)) throw new TRPCError({ code: "UNAUTHORIZED" });

      const targetTopRolePosition = await getTopRolePosition(ctx.db, userId, roomId);
      if (!isManageable(actorTopPosition, targetTopRolePosition, isOwner))
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const device = { sessionId: ctx.getSessionPayload.session.id, userId: actorUserId };
      const [userToRoomRole] = await ctx.db
        .insert(usersToRoomRoles)
        .values({ roleId, roomId, userId })
        .onConflictDoNothing()
        .returning();
      if (userToRoomRole) roleEventEmitter.emit("assignRole", [{ ...role, userId }, device]);
      return role;
    },
  ),
  createRole: getPermissionsProcedure(RoomPermission.ManageRoles, createRoleInputSchema, "roomId").mutation<RoomRole>(
    async ({ ctx, input: { color, name, permissions, position, roomId } }) => {
      const actorUserId = ctx.getSessionPayload.user.id;
      const { actorTopPosition, isOwner } = await getActorContext(ctx.db, actorUserId, roomId);

      if (!isManageable(actorTopPosition, position, isOwner)) throw new TRPCError({ code: "UNAUTHORIZED" });

      if (!isOwner) {
        const actorPermissions = await getPermissions(ctx.db, actorUserId, roomId);
        const hasAdmin = Boolean(actorPermissions & RoomPermission.Administrator);
        if (!hasAdmin && (permissions & ~actorPermissions) !== 0n) throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const createdRole = (
        await ctx.db.insert(roomRoles).values({ color, name, permissions, position, roomId }).returning()
      )[0];
      if (!createdRole)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Create,
            DatabaseEntityType.RoomRole,
            JSON.stringify({ name, roomId }),
          ).message,
        });

      roleEventEmitter.emit("createRole", [
        createdRole,
        { sessionId: ctx.getSessionPayload.session.id, userId: actorUserId },
      ]);
      return createdRole;
    },
  ),
  deleteRole: getPermissionsProcedure(RoomPermission.ManageRoles, deleteRoleInputSchema, "roomId").mutation<RoomRole>(
    async ({ ctx, input: { id, roomId } }) => {
      const actorUserId = ctx.getSessionPayload.user.id;
      const [role, actorContext] = await Promise.all([
        ctx.db.query.roomRoles.findFirst({
          columns: { isEveryone: true, position: true },
          where: (roomRoles, { and, eq }) => and(eq(roomRoles.id, id), eq(roomRoles.roomId, roomId)),
        }),
        getActorContext(ctx.db, actorUserId, roomId),
      ]);

      if (!role)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomRole, id).message,
        });
      if (role.isEveryone)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.RoomRole, id).message,
        });

      const { actorTopPosition, isOwner } = actorContext;
      if (!isManageable(actorTopPosition, role.position, isOwner)) throw new TRPCError({ code: "UNAUTHORIZED" });

      const deletedRole = (
        await ctx.db
          .delete(roomRoles)
          .where(and(eq(roomRoles.id, id), eq(roomRoles.roomId, roomId)))
          .returning()
      )[0];
      if (!deletedRole)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomRole, id).message,
        });

      roleEventEmitter.emit("deleteRole", [
        { id, roomId },
        { sessionId: ctx.getSessionPayload.session.id, userId: actorUserId },
      ]);
      return deletedRole;
    },
  ),
  onAssignRole: getMemberProcedure(onRoleInputSchema, "roomId").subscription(async function* ({
    ctx,
    input: { roomId },
    signal,
  }) {
    for await (const [[data, device]] of on(roleEventEmitter, "assignRole", { signal }))
      if (data.roomId === roomId && !getIsSameDevice(device, ctx.getSessionPayload)) yield data;
  }),
  onCreateRole: getMemberProcedure(onRoleInputSchema, "roomId").subscription(async function* ({
    ctx,
    input: { roomId },
    signal,
  }) {
    for await (const [[data, device]] of on(roleEventEmitter, "createRole", { signal }))
      if (data.roomId === roomId && !getIsSameDevice(device, ctx.getSessionPayload)) yield data;
  }),
  onDeleteRole: getMemberProcedure(onRoleInputSchema, "roomId").subscription(async function* ({
    ctx,
    input: { roomId },
    signal,
  }) {
    for await (const [[data, device]] of on(roleEventEmitter, "deleteRole", { signal }))
      if (data.roomId === roomId && !getIsSameDevice(device, ctx.getSessionPayload)) yield data;
  }),
  onRevokeRole: getMemberProcedure(onRoleInputSchema, "roomId").subscription(async function* ({
    ctx,
    input: { roomId },
    signal,
  }) {
    for await (const [[data, device]] of on(roleEventEmitter, "revokeRole", { signal }))
      if (data.roomId === roomId && !getIsSameDevice(device, ctx.getSessionPayload)) yield data;
  }),
  onUpdateRole: getMemberProcedure(onRoleInputSchema, "roomId").subscription(async function* ({
    ctx,
    input: { roomId },
    signal,
  }) {
    for await (const [[data, device]] of on(roleEventEmitter, "updateRole", { signal }))
      if (data.roomId === roomId && !getIsSameDevice(device, ctx.getSessionPayload)) yield data;
  }),
  readMemberRoles: getMemberProcedure(readMemberRolesInputSchema, "roomId").query<UserToRoomRoleWithRelations[]>(
    async ({ ctx, input: { roomId, userIds } }) => {
      const results = await ctx.db.query.usersToRoomRoles.findMany({
        where: (usersToRoomRoles, { and, eq, inArray }) =>
          and(eq(usersToRoomRoles.roomId, roomId), inArray(usersToRoomRoles.userId, userIds)),
        with: UserToRoomRoleRelations,
      });
      return results;
    },
  ),
  readMyPermissions: standardAuthedProcedure
    .input(readMyPermissionsInputSchema)
    .query(async ({ ctx, input: { roomIds } }) => {
      const userId = ctx.getSessionPayload.user.id;
      const [rooms, permissionsMap, topRolePositionMap] = await Promise.all([
        ctx.db.query.rooms.findMany({
          columns: { id: true, userId: true },
          where: (rooms, { inArray }) => inArray(rooms.id, roomIds),
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
    .query<RoomRole[]>(async ({ ctx, input: { roomIds } }) => {
      await isMember(ctx.db, ctx.getSessionPayload, roomIds);
      return ctx.db.query.roomRoles.findMany({
        orderBy: (roomRoles, { desc }) => [desc(roomRoles.position)],
        where: (roomRoles, { inArray }) => inArray(roomRoles.roomId, roomIds),
      });
    }),
  revokeRole: getPermissionsProcedure(RoomPermission.ManageRoles, revokeRoleInputSchema, "roomId").mutation(
    async ({ ctx, input: { roleId, roomId, userId } }) => {
      const actorUserId = ctx.getSessionPayload.user.id;
      const [role, actorContext] = await Promise.all([
        ctx.db.query.roomRoles.findFirst({
          columns: { position: true },
          where: (roomRoles, { and, eq }) => and(eq(roomRoles.id, roleId), eq(roomRoles.roomId, roomId)),
        }),
        getActorContext(ctx.db, actorUserId, roomId),
      ]);

      if (!role)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomRole, roleId).message,
        });

      const { actorTopPosition, isOwner } = actorContext;
      if (!isManageable(actorTopPosition, role.position, isOwner)) throw new TRPCError({ code: "UNAUTHORIZED" });

      const targetTopRolePosition = await getTopRolePosition(ctx.db, userId, roomId);
      if (!isManageable(actorTopPosition, targetTopRolePosition, isOwner))
        throw new TRPCError({ code: "UNAUTHORIZED" });

      await ctx.db
        .delete(usersToRoomRoles)
        .where(
          and(
            eq(usersToRoomRoles.userId, userId),
            eq(usersToRoomRoles.roomId, roomId),
            eq(usersToRoomRoles.roleId, roleId),
          ),
        );
      roleEventEmitter.emit("revokeRole", [
        { roleId, roomId, userId },
        { sessionId: ctx.getSessionPayload.session.id, userId: actorUserId },
      ]);
    },
  ),
  updateRole: getPermissionsProcedure(RoomPermission.ManageRoles, updateRoleInputSchema, "roomId").mutation<RoomRole>(
    async ({ ctx, input: { id, roomId, ...rest } }) => {
      const actorUserId = ctx.getSessionPayload.user.id;
      const [role, actorContext] = await Promise.all([
        ctx.db.query.roomRoles.findFirst({
          columns: { position: true },
          where: (roomRoles, { and, eq }) => and(eq(roomRoles.id, id), eq(roomRoles.roomId, roomId)),
        }),
        getActorContext(ctx.db, actorUserId, roomId),
      ]);

      if (!role)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomRole, id).message,
        });

      const { actorTopPosition, isOwner } = actorContext;
      if (
        !isManageable(actorTopPosition, role.position, isOwner) ||
        (rest.position !== undefined && !isManageable(actorTopPosition, rest.position, isOwner))
      )
        throw new TRPCError({ code: "UNAUTHORIZED" });
      else if (rest.permissions !== undefined && !isOwner) {
        const actorPermissions = await getPermissions(ctx.db, actorUserId, roomId);
        const hasAdmin = Boolean(actorPermissions & RoomPermission.Administrator);
        if (!hasAdmin && (rest.permissions & ~actorPermissions) !== 0n) throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const updatedRole = (
        await ctx.db
          .update(roomRoles)
          .set(rest)
          .where(and(eq(roomRoles.id, id), eq(roomRoles.roomId, roomId)))
          .returning()
      )[0];
      if (!updatedRole)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomRole, id).message,
        });

      roleEventEmitter.emit("updateRole", [
        updatedRole,
        { sessionId: ctx.getSessionPayload.session.id, userId: actorUserId },
      ]);
      return updatedRole;
    },
  ),
});
