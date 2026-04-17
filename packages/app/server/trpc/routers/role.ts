import type { RoomRole } from "@esposter/db-schema";

import { assignRoleInputSchema } from "#shared/models/db/role/AssignRoleInput";
import { createRoleInputSchema } from "#shared/models/db/role/CreateRoleInput";
import { deleteRoleInputSchema } from "#shared/models/db/role/DeleteRoleInput";
import { getMemberRolesInputSchema } from "#shared/models/db/role/GetMemberRolesInput";
import { readRolesInputSchema } from "#shared/models/db/role/ReadRolesInput";
import { revokeRoleInputSchema } from "#shared/models/db/role/RevokeRoleInput";
import { updateRoleInputSchema } from "#shared/models/db/role/UpdateRoleInput";
import { on } from "@@/server/services/events/on";
import { roleEventEmitter } from "@@/server/services/message/events/roleEventEmitter";
import { getPermissions } from "@@/server/services/room/rbac/getPermissions";
import { getTopRolePosition } from "@@/server/services/room/rbac/getTopRolePosition";
import { isManageable } from "@@/server/services/room/rbac/isManageable";
import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { DatabaseEntityType, RoomPermission, roomRoles, selectRoomSchema, usersToRoomRoles } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

export type { AssignRoleInput } from "#shared/models/db/role/AssignRoleInput";
export type { CreateRoleInput } from "#shared/models/db/role/CreateRoleInput";
export type { DeleteRoleInput } from "#shared/models/db/role/DeleteRoleInput";
export type { GetMemberRolesInput } from "#shared/models/db/role/GetMemberRolesInput";
export type { ReadRolesInput } from "#shared/models/db/role/ReadRolesInput";
export type { RevokeRoleInput } from "#shared/models/db/role/RevokeRoleInput";
export type { UpdateRoleInput } from "#shared/models/db/role/UpdateRoleInput";

const onRoleUpdateInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnRoleUpdateInput = z.infer<typeof onRoleUpdateInputSchema>;

export const roleRouter = router({
  assignRole: getPermissionsProcedure(RoomPermission.ManageRoles, assignRoleInputSchema, "roomId").mutation(
    async ({ ctx, input: { roleId, roomId, userId } }) => {
      const role = await ctx.db.query.roomRoles.findFirst({
        columns: { position: true },
        where: (roomRoles, { and, eq }) => and(eq(roomRoles.id, roleId), eq(roomRoles.roomId, roomId)),
      });
      if (!role)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomRole, roleId).message,
        });

      const actorId = ctx.getSessionPayload.user.id;
      const roleManageable = await isManageable(ctx.db, actorId, roomId, role.position);
      if (!roleManageable) throw new TRPCError({ code: "UNAUTHORIZED" });

      const targetTopRolePosition = await getTopRolePosition(ctx.db, userId, roomId);
      const targetManageable = await isManageable(ctx.db, actorId, roomId, targetTopRolePosition);
      if (!targetManageable) throw new TRPCError({ code: "UNAUTHORIZED" });

      await ctx.db.insert(usersToRoomRoles).values({ roleId, roomId, userId });
      roleEventEmitter.emit("updateRole", { roomId });
    },
  ),
  createRole: getPermissionsProcedure(RoomPermission.ManageRoles, createRoleInputSchema, "roomId").mutation<RoomRole>(
    async ({ ctx, input: { color, name, permissions, position, roomId } }) => {
      const manageable = await isManageable(ctx.db, ctx.getSessionPayload.user.id, roomId, position);
      if (!manageable) throw new TRPCError({ code: "UNAUTHORIZED" });

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

      roleEventEmitter.emit("updateRole", { roomId });
      return createdRole;
    },
  ),
  deleteRole: getPermissionsProcedure(RoomPermission.ManageRoles, deleteRoleInputSchema, "roomId").mutation<RoomRole>(
    async ({ ctx, input: { id, roomId } }) => {
      const role = await ctx.db.query.roomRoles.findFirst({
        columns: { isEveryone: true, position: true },
        where: (roomRoles, { and, eq }) => and(eq(roomRoles.id, id), eq(roomRoles.roomId, roomId)),
      });
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

      const manageable = await isManageable(ctx.db, ctx.getSessionPayload.user.id, roomId, role.position);
      if (!manageable) throw new TRPCError({ code: "UNAUTHORIZED" });

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

      roleEventEmitter.emit("updateRole", { roomId });
      return deletedRole;
    },
  ),
  getMemberRoles: getMemberProcedure(getMemberRolesInputSchema, "roomId").query<RoomRole[]>(
    ({ ctx, input: { roomId, userId } }) =>
      ctx.db
        .select({
          color: roomRoles.color,
          id: roomRoles.id,
          isEveryone: roomRoles.isEveryone,
          name: roomRoles.name,
          permissions: roomRoles.permissions,
          position: roomRoles.position,
          roomId: roomRoles.roomId,
        })
        .from(roomRoles)
        .innerJoin(usersToRoomRoles, eq(usersToRoomRoles.roleId, roomRoles.id))
        .where(
          and(eq(roomRoles.roomId, roomId), eq(usersToRoomRoles.userId, userId), eq(usersToRoomRoles.roomId, roomId)),
        ),
  ),
  getMyPermissions: getMemberProcedure(readRolesInputSchema, "roomId").query(async ({ ctx, input: { roomId } }) => {
    const userId = ctx.getSessionPayload.user.id;
    const room = await ctx.db.query.rooms.findFirst({
      columns: { userId: true },
      where: (rooms, { eq }) => eq(rooms.id, roomId),
    });
    if (!room) return { isRoomOwner: false, permissions: 0n, topRolePosition: -1 };

    const [permissions, topRolePosition] = await Promise.all([
      getPermissions(ctx.db, userId, roomId),
      getTopRolePosition(ctx.db, userId, roomId),
    ]);
    return { isRoomOwner: room.userId === userId, permissions, topRolePosition };
  }),
  onRoleUpdate: getMemberProcedure(onRoleUpdateInputSchema, "roomId").subscription(async function* ({
    input: { roomId },
    signal,
  }) {
    for await (const [{ roomId: emittedRoomId }] of on(roleEventEmitter, "updateRole", { signal })) {
      if (emittedRoomId !== roomId) continue;
      yield roomId;
    }
  }),
  readRoles: getMemberProcedure(readRolesInputSchema, "roomId").query<RoomRole[]>(({ ctx, input: { roomId } }) =>
    ctx.db.select().from(roomRoles).where(eq(roomRoles.roomId, roomId)).orderBy(desc(roomRoles.position)),
  ),
  revokeRole: getPermissionsProcedure(RoomPermission.ManageRoles, revokeRoleInputSchema, "roomId").mutation(
    async ({ ctx, input: { roleId, roomId, userId } }) => {
      const role = await ctx.db.query.roomRoles.findFirst({
        columns: { position: true },
        where: (roomRoles, { and, eq }) => and(eq(roomRoles.id, roleId), eq(roomRoles.roomId, roomId)),
      });
      if (!role)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomRole, roleId).message,
        });

      const actorId = ctx.getSessionPayload.user.id;
      const roleManageable = await isManageable(ctx.db, actorId, roomId, role.position);
      if (!roleManageable) throw new TRPCError({ code: "UNAUTHORIZED" });

      const targetTopRolePosition = await getTopRolePosition(ctx.db, userId, roomId);
      const targetManageable = await isManageable(ctx.db, actorId, roomId, targetTopRolePosition);
      if (!targetManageable) throw new TRPCError({ code: "UNAUTHORIZED" });

      await ctx.db
        .delete(usersToRoomRoles)
        .where(
          and(
            eq(usersToRoomRoles.userId, userId),
            eq(usersToRoomRoles.roomId, roomId),
            eq(usersToRoomRoles.roleId, roleId),
          ),
        );
      roleEventEmitter.emit("updateRole", { roomId });
    },
  ),
  updateRole: getPermissionsProcedure(RoomPermission.ManageRoles, updateRoleInputSchema, "roomId").mutation<RoomRole>(
    async ({ ctx, input: { id, roomId, ...rest } }) => {
      const role = await ctx.db.query.roomRoles.findFirst({
        columns: { position: true },
        where: (roomRoles, { and, eq }) => and(eq(roomRoles.id, id), eq(roomRoles.roomId, roomId)),
      });
      if (!role)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomRole, id).message,
        });

      const manageable = await isManageable(ctx.db, ctx.getSessionPayload.user.id, roomId, role.position);
      if (!manageable) throw new TRPCError({ code: "UNAUTHORIZED" });

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

      roleEventEmitter.emit("updateRole", { roomId });
      return updatedRole;
    },
  ),
});
