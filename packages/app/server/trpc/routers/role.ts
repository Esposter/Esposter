import type { RoomRole } from "@esposter/db-schema";

import { assignRoleInputSchema } from "#shared/models/db/role/AssignRoleInput";
import { createRoleInputSchema } from "#shared/models/db/role/CreateRoleInput";
import { deleteRoleInputSchema } from "#shared/models/db/role/DeleteRoleInput";
import { readMemberRolesInputSchema } from "#shared/models/db/role/ReadMemberRolesInput";
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
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { DatabaseEntityType, RoomPermission, roomRoles, selectRoomSchema, usersToRoomRoles } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

const onRoleInputSchema = z.object({ roomId: selectRoomSchema.shape.id });

export const roleRouter = router({
  assignRole: getPermissionsProcedure(RoomPermission.ManageRoles, assignRoleInputSchema, "roomId").mutation<RoomRole>(
    async ({ ctx, input: { roleId, roomId, userId } }) => {
      const actorId = ctx.getSessionPayload.user.id;
      const [role, member, actorContext] = await Promise.all([
        ctx.db.query.roomRoles.findFirst({
          where: (roomRoles, { and, eq }) => and(eq(roomRoles.id, roleId), eq(roomRoles.roomId, roomId)),
        }),
        ctx.db.query.usersToRooms.findFirst({
          columns: { userId: true },
          where: (usersToRooms, { and, eq }) => and(eq(usersToRooms.userId, userId), eq(usersToRooms.roomId, roomId)),
        }),
        getActorContext(ctx.db, actorId, roomId),
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

      const device = { sessionId: ctx.getSessionPayload.session.id, userId: actorId };
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
      const actorId = ctx.getSessionPayload.user.id;
      const { actorTopPosition, isOwner } = await getActorContext(ctx.db, actorId, roomId);

      if (!isManageable(actorTopPosition, position, isOwner)) throw new TRPCError({ code: "UNAUTHORIZED" });

      if (!isOwner) {
        const actorPermissions = await getPermissions(ctx.db, actorId, roomId);
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
        { sessionId: ctx.getSessionPayload.session.id, userId: actorId },
      ]);
      return createdRole;
    },
  ),
  deleteRole: getPermissionsProcedure(RoomPermission.ManageRoles, deleteRoleInputSchema, "roomId").mutation<RoomRole>(
    async ({ ctx, input: { id, roomId } }) => {
      const actorId = ctx.getSessionPayload.user.id;
      const [role, actorContext] = await Promise.all([
        ctx.db.query.roomRoles.findFirst({
          columns: { isEveryone: true, position: true },
          where: (roomRoles, { and, eq }) => and(eq(roomRoles.id, id), eq(roomRoles.roomId, roomId)),
        }),
        getActorContext(ctx.db, actorId, roomId),
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
        { sessionId: ctx.getSessionPayload.session.id, userId: actorId },
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
  readMemberRoles: getMemberProcedure(readMemberRolesInputSchema, "roomId").query<(RoomRole & { userId: string })[]>(
    ({ ctx, input: { roomId, userIds } }) =>
      ctx.db
        .select({
          color: roomRoles.color,
          createdAt: roomRoles.createdAt,
          deletedAt: roomRoles.deletedAt,
          id: roomRoles.id,
          isEveryone: roomRoles.isEveryone,
          name: roomRoles.name,
          permissions: roomRoles.permissions,
          position: roomRoles.position,
          roomId: roomRoles.roomId,
          updatedAt: roomRoles.updatedAt,
          userId: usersToRoomRoles.userId,
        })
        .from(roomRoles)
        .innerJoin(usersToRoomRoles, eq(usersToRoomRoles.roleId, roomRoles.id))
        .where(
          and(
            eq(roomRoles.roomId, roomId),
            inArray(usersToRoomRoles.userId, userIds),
            eq(usersToRoomRoles.roomId, roomId),
          ),
        ),
  ),
  readMyPermissions: getMemberProcedure(readRolesInputSchema, "roomId").query(async ({ ctx, input: { roomId } }) => {
    const userId = ctx.getSessionPayload.user.id;
    const [room, permissions, topRolePosition] = await Promise.all([
      ctx.db.query.rooms.findFirst({ columns: { userId: true }, where: (rooms, { eq }) => eq(rooms.id, roomId) }),
      getPermissions(ctx.db, userId, roomId),
      getTopRolePosition(ctx.db, userId, roomId),
    ]);
    return { isRoomOwner: room?.userId === userId, permissions, topRolePosition };
  }),
  readRoles: getMemberProcedure(readRolesInputSchema, "roomId").query<RoomRole[]>(({ ctx, input: { roomId } }) =>
    ctx.db.select().from(roomRoles).where(eq(roomRoles.roomId, roomId)).orderBy(desc(roomRoles.position)),
  ),
  revokeRole: getPermissionsProcedure(RoomPermission.ManageRoles, revokeRoleInputSchema, "roomId").mutation(
    async ({ ctx, input: { roleId, roomId, userId } }) => {
      const actorId = ctx.getSessionPayload.user.id;
      const [role, actorContext] = await Promise.all([
        ctx.db.query.roomRoles.findFirst({
          columns: { position: true },
          where: (roomRoles, { and, eq }) => and(eq(roomRoles.id, roleId), eq(roomRoles.roomId, roomId)),
        }),
        getActorContext(ctx.db, actorId, roomId),
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
        { sessionId: ctx.getSessionPayload.session.id, userId: actorId },
      ]);
    },
  ),
  updateRole: getPermissionsProcedure(RoomPermission.ManageRoles, updateRoleInputSchema, "roomId").mutation<RoomRole>(
    async ({ ctx, input: { id, roomId, ...rest } }) => {
      const actorId = ctx.getSessionPayload.user.id;
      const [role, actorContext] = await Promise.all([
        ctx.db.query.roomRoles.findFirst({
          columns: { position: true },
          where: (roomRoles, { and, eq }) => and(eq(roomRoles.id, id), eq(roomRoles.roomId, roomId)),
        }),
        getActorContext(ctx.db, actorId, roomId),
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
        const actorPermissions = await getPermissions(ctx.db, actorId, roomId);
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
        { sessionId: ctx.getSessionPayload.session.id, userId: actorId },
      ]);
      return updatedRole;
    },
  ),
});
