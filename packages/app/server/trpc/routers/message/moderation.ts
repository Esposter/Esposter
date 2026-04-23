import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Ban, BanWithRelations, Clause } from "@esposter/db-schema";

import { executeAdminActionInputSchema } from "#shared/models/db/moderation/ExecuteAdminActionInput";
import { readBansInputSchema } from "#shared/models/db/moderation/ReadBansInput";
import { readModerationLogInputSchema } from "#shared/models/db/moderation/ReadModerationLogInput";
import { unbanUserInputSchema } from "#shared/models/db/moderation/UnbanUserInput";
import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { isManageable } from "#shared/services/room/rbac/isManageable";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { on } from "@@/server/services/events/on";
import { moderationEventEmitter } from "@@/server/services/message/events/moderationEventEmitter";
import { AdminActionPermissionMap } from "@@/server/services/message/moderation/AdminActionPermissionMap";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { getActorContext } from "@@/server/services/room/rbac/getActorContext";
import { getTopRolePosition } from "@@/server/services/room/rbac/getTopRolePosition";
import { hasPermission } from "@@/server/services/room/rbac/hasPermission";
import { router } from "@@/server/trpc";
import { moderationLogPlugin } from "@@/server/trpc/plugins/moderationLogPlugin";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { getTableNullClause, getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AdminActionType,
  AzureTable,
  bans,
  BinaryOperator,
  CompositeKeyPropertyNames,
  DatabaseEntityType,
  ModerationLogEntity,
  RoomPermission,
  selectRoomSchema,
  users,
  usersToRoomRoles,
  usersToRooms,
} from "@esposter/db-schema";
import { ItemMetadataPropertyNames, NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, isNull, SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";

const onAdminActionInputSchema = z.object({ roomId: selectRoomSchema.shape.id });

export const moderationRouter = router({
  executeAdminAction: getMemberProcedure(executeAdminActionInputSchema, "roomId")
    .concat(moderationLogPlugin)
    .mutation(async ({ ctx, input: { durationMs, roomId, targetUserId, type } }) => {
      const actorId = ctx.getSessionPayload.user.id;
      const [isPermitted, actorContext, targetTopPosition] = await Promise.all([
        hasPermission(ctx.db, actorId, roomId, AdminActionPermissionMap[type]),
        getActorContext(ctx.db, actorId, roomId),
        getTopRolePosition(ctx.db, targetUserId, roomId),
      ]);

      if (!isPermitted || !isManageable(actorContext.actorTopPosition, targetTopPosition, actorContext.isOwner))
        throw new TRPCError({ code: "UNAUTHORIZED" });

      switch (type) {
        case AdminActionType.BanUser:
          await ctx.db.transaction(async (tx) => {
            await tx
              .delete(usersToRooms)
              .where(and(eq(usersToRooms.userId, targetUserId), eq(usersToRooms.roomId, roomId)));
            await tx
              .delete(usersToRoomRoles)
              .where(and(eq(usersToRoomRoles.userId, targetUserId), eq(usersToRoomRoles.roomId, roomId)));
            await tx
              .insert(bans)
              .values({ bannedByUserId: actorId, roomId, userId: targetUserId })
              .onConflictDoNothing();
          });
          break;
        case AdminActionType.KickFromRoom:
          await ctx.db
            .delete(usersToRooms)
            .where(and(eq(usersToRooms.userId, targetUserId), eq(usersToRooms.roomId, roomId)));
          break;
        case AdminActionType.TimeoutUser: {
          if (!durationMs) throw new TRPCError({ code: "BAD_REQUEST" });
          await ctx.db
            .update(usersToRooms)
            .set({ timeoutUntil: new Date(Date.now() + durationMs) })
            .where(and(eq(usersToRooms.userId, targetUserId), eq(usersToRooms.roomId, roomId)));
          break;
        }
        // ForceMute, ForceUnmute, KickFromVoice: client-side only via subscription
      }

      moderationEventEmitter.emit("adminAction", { durationMs, roomId, targetUserId, type });
    }),
  onAdminAction: getMemberProcedure(onAdminActionInputSchema, "roomId").subscription(async function* ({
    ctx,
    input: { roomId },
    signal,
  }) {
    for await (const [{ durationMs, roomId: emittedRoomId, targetUserId, type }] of on(
      moderationEventEmitter,
      "adminAction",
      { signal },
    )) {
      if (emittedRoomId !== roomId || targetUserId !== ctx.getSessionPayload.user.id) continue;
      yield { durationMs, type };
    }
  }),
  readBans: getPermissionsProcedure(RoomPermission.BanMembers, readBansInputSchema, "roomId").query<
    CursorPaginationData<BanWithRelations>
  >(async ({ ctx, input: { cursor, limit, roomId } }) => {
    const sortBy: SortItem<keyof Ban>[] = [{ key: "createdAt", order: SortOrder.Desc }];
    const wheres: (SQL | undefined)[] = [eq(bans.roomId, roomId), isNull(bans.deletedAt)];
    if (cursor) wheres.push(getCursorWhere(bans, cursor, sortBy));

    const bannedByUsers = alias(users, "bannedByUsers");
    const results = await ctx.db
      .select({
        ...getTableColumns(bans),
        bannedByUser: getTableColumns(bannedByUsers),
        user: getTableColumns(users),
      })
      .from(bans)
      .innerJoin(users, eq(bans.userId, users.id))
      .leftJoin(bannedByUsers, eq(bans.bannedByUserId, bannedByUsers.id))
      .where(and(...wheres))
      .orderBy(...parseSortByToSql(bans, sortBy))
      .limit(limit + 1);

    return getCursorPaginationData(results, limit, sortBy);
  }),
  readModerationLog: getPermissionsProcedure(RoomPermission.ManageRoom, readModerationLogInputSchema, "roomId").query(
    async ({ input: { cursor, limit, roomId } }) => {
      const sortBy: SortItem<keyof ModerationLogEntity>[] = [MESSAGE_ROWKEY_SORT_ITEM];
      const clauses: Clause<ModerationLogEntity>[] = [
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
        getTableNullClause(ItemMetadataPropertyNames.deletedAt),
      ];
      if (cursor) clauses.push(...getCursorWhereAzureTable(cursor, sortBy));

      const moderationLogClient = await useTableClient(AzureTable.ModerationLog);
      const entries = await getTopNEntities(moderationLogClient, limit + 1, ModerationLogEntity, {
        filter: serializeClauses(clauses),
      });
      return getCursorPaginationData(entries, limit, sortBy);
    },
  ),
  unbanUser: getPermissionsProcedure(RoomPermission.BanMembers, unbanUserInputSchema, "roomId").mutation(
    async ({ ctx, input: { roomId, userId } }) => {
      const ban = await ctx.db.query.bans.findFirst({
        columns: { userId: true },
        where: (bans, { and, eq }) => and(eq(bans.roomId, roomId), eq(bans.userId, userId)),
      });
      if (!ban)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Ban, userId).message,
        });

      await ctx.db.delete(bans).where(and(eq(bans.roomId, roomId), eq(bans.userId, userId)));
    },
  ),
});
