import type { RoomRoleInMessage, UserToRoomRoleInMessageWithRelations } from "@esposter/db-schema";

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
  roomRolesInMessage,
  selectRoomInMessageSchema,
  UserToRoomRoleInMessageRelations,
  usersToRoomRolesInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const onRoleInputSchema = z.object({ roomId: selectRoomInMessageSchema.shape.id });

export const roleRouter = router({
  assignRole: getPermissionsProcedure(RoomPermission.ManageRoles, assignRoleInputSchema, "roomId").mutation<RoomRoleInMessage>(
    async ({ ctx, input: { roleId, roomId, userId } }) => {
      const actorUserId = ctx.getSessionPayload.user.id;
      const [role, member, actorContext] = await Promise.all([
        ctx.db.query.roomRolesInMessage.findFirst({
          where: { id: { eq: roleId }, roomId: { eq: roomId } },
        }),
        ctx.db.query.usersToRoomsInMessage.findFirst({
          columns: { userId: true },
          where: { userId: { eq: userId }, roomId: { eq: roomId } },
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
        .insert(usersToRoomRolesInMessage)
        .values({ roleId, roomId, userId })
        .onConflictDoNothing()
        .returning();
      if (userToRoomRole) roleEventEmitter.emit("assignRole", [{ ...role, userId }, device]);
      return role;
    },
  ),
  createRole: getPermissionsProcedure(RoomPermission.ManageRoles, createRoleInputSchema, "roomId").mutation<RoomRoleInMessage>(
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
        await ctx.db.insert(roomRolesInMessage).values({ color, name, permissions, position, roomId }).returning()
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
  deleteRole: getPermissionsProcedure(RoomPermission.ManageRoles, deleteRoleInputSchema, "roomId").mutation<RoomRoleInMessage>(
    async ({ ctx, input: { id, roomId } }) => {
      const actorUserId = ctx.getSessionPayload.user.id;
      const [role, actorContext] = await Promise.all([
        ctx.db.query.roomRolesInMessage.findFirst({
          columns: { isEveryone: true, position: true },
          where: { id: { eq: id }, roomId: { eq: roomId } },
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
          .delete(roomRolesInMessage)
          .where(and(eq(roomRolesInMessage.id, id), eq(roomRolesInMessage.roomId, roomId)))
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
  readMemberRoles: getMemberProcedure(readMemberRolesInputSchema, "roomId").query<UserToRoomRoleInMessageWithRelations[]>(
    ({ ctx, input: { roomId, userIds } }) =>
      ctx.db.query.usersToRoomRolesInMessage.findMany({
        where: { roomId: { eq: roomId }, userId: { in: userIds } },
        with: UserToRoomRoleInMessageRelations,
      }),
  ),
  readMyPermissions: standardAuthedProcedure
    .input(readMyPermissionsInputSchema)
    .query(async ({ ctx, input: { roomIds } }) => {
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
      await isMember(ctx.db, ctx.getSessionPayload, roomIds);
      return ctx.db.query.roomRolesInMessage.findMany({
        orderBy: { position: "desc" },
        where: { roomId: { in: roomIds } },
      });
    }),
  revokeRole: getPermissionsProcedure(RoomPermission.ManageRoles, revokeRoleInputSchema, "roomId").mutation(
    async ({ ctx, input: { roleId, roomId, userId } }) => {
      const actorUserId = ctx.getSessionPayload.user.id;
      const [role, actorContext] = await Promise.all([
        ctx.db.query.roomRolesInMessage.findFirst({
          columns: { position: true },
          where: { id: { eq: roleId }, roomId: { eq: roomId } },
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
  updateRole: getPermissionsProcedure(RoomPermission.ManageRoles, updateRoleInputSchema, "roomId").mutation<RoomRoleInMessage>(
    async ({ ctx, input: { id, roomId, ...rest } }) => {
      const actorUserId = ctx.getSessionPayload.user.id;
      const [role, actorContext] = await Promise.all([
        ctx.db.query.roomRolesInMessage.findFirst({
          columns: { position: true },
          where: { id: { eq: id }, roomId: { eq: roomId } },
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
          .update(roomRolesInMessage)
          .set(rest)
          .where(and(eq(roomRolesInMessage.id, id), eq(roomRolesInMessage.roomId, roomId)))
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
