import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { BanInMessage, BanInMessageWithRelations, Clause } from "@esposter/db-schema";

import { deleteBanInputSchema } from "#shared/models/db/moderation/DeleteBanInput";
import { executeAdminActionInputSchema } from "#shared/models/db/moderation/ExecuteAdminActionInput";
import { readBansInputSchema } from "#shared/models/db/moderation/ReadBansInput";
import { readModerationLogInputSchema } from "#shared/models/db/moderation/ReadModerationLogInput";
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
  bansInMessage,
  BinaryOperator,
  CompositeKeyPropertyNames,
  DatabaseEntityType,
  ModerationLogEntity,
  roomIdSchema,
  RoomPermission,
  users,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { exhaustiveGuard, ItemMetadataPropertyNames, NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getColumns, isNull, SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const onAdminActionInputSchema = roomIdSchema;

export const moderationRouter = router({
  deleteBan: getPermissionsProcedure(RoomPermission.BanMembers, deleteBanInputSchema, "roomId").mutation(
    async ({ ctx, input: { roomId, userId } }) => {
      const ban = await ctx.db.query.bansInMessage.findFirst({
        columns: { userId: true },
        where: { roomId: { eq: roomId }, userId: { eq: userId } },
      });
      if (!ban)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Ban, userId).message,
        });

      await ctx.db.delete(bansInMessage).where(and(eq(bansInMessage.roomId, roomId), eq(bansInMessage.userId, userId)));
    },
  ),
  // oxlint-disable-next-line prefer-spread
  executeAdminAction: getMemberProcedure(executeAdminActionInputSchema, "roomId")
    .concat(moderationLogPlugin)
    .mutation(async ({ ctx, input }) => {
      const { roomId, targetUserId } = input;
      const actorUserId = ctx.getSessionPayload.user.id;
      const [isPermitted, actorContext, targetTopPosition] = await Promise.all([
        hasPermission(ctx.db, actorUserId, roomId, AdminActionPermissionMap[input.type]),
        getActorContext(ctx.db, actorUserId, roomId),
        getTopRolePosition(ctx.db, targetUserId, roomId),
      ]);

      if (!isPermitted || !isManageable(actorContext.actorTopPosition, targetTopPosition, actorContext.isOwner))
        throw new TRPCError({ code: "UNAUTHORIZED" });

      switch (input.type) {
        case AdminActionType.CreateBan:
          await ctx.db.transaction(async (tx) => {
            await tx
              .delete(usersToRoomsInMessage)
              .where(and(eq(usersToRoomsInMessage.userId, targetUserId), eq(usersToRoomsInMessage.roomId, roomId)));
            await tx
              .insert(bansInMessage)
              .values({ bannedByUserId: actorUserId, roomId, userId: targetUserId })
              .onConflictDoNothing();
          });
          break;
        case AdminActionType.ForceMute:
        case AdminActionType.ForceUnmute:
        case AdminActionType.KickFromVoice:
          break;
        case AdminActionType.KickFromRoom:
          await ctx.db
            .delete(usersToRoomsInMessage)
            .where(and(eq(usersToRoomsInMessage.userId, targetUserId), eq(usersToRoomsInMessage.roomId, roomId)));
          break;
        case AdminActionType.TimeoutUser:
          await ctx.db
            .update(usersToRoomsInMessage)
            .set({ timeoutUntil: new Date(Date.now() + input.durationMs) })
            .where(and(eq(usersToRoomsInMessage.userId, targetUserId), eq(usersToRoomsInMessage.roomId, roomId)));
          break;
        default:
          exhaustiveGuard(input);
      }

      moderationEventEmitter.emit("adminAction", {
        durationMs: input.type === AdminActionType.TimeoutUser ? input.durationMs : undefined,
        roomId,
        targetUserId,
        type: input.type,
      });
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
    CursorPaginationData<BanInMessageWithRelations>
  >(async ({ ctx, input: { cursor, limit, roomId } }) => {
    const sortBy: SortItem<keyof BanInMessage>[] = [{ key: "createdAt", order: SortOrder.Desc }];
    const wheres: (SQL | undefined)[] = [eq(bansInMessage.roomId, roomId), isNull(bansInMessage.deletedAt)];
    if (cursor) wheres.push(getCursorWhere(bansInMessage, cursor, sortBy));

    const bannedByUsers = alias(users, "bannedByUsers");
    const readBans = await ctx.db
      .select({
        ...getColumns(bansInMessage),
        bannedByUser: getColumns(bannedByUsers),
        user: getColumns(users),
      })
      .from(bansInMessage)
      .innerJoin(users, eq(bansInMessage.userId, users.id))
      .leftJoin(bannedByUsers, eq(bansInMessage.bannedByUserId, bannedByUsers.id))
      .where(and(...wheres))
      .orderBy(...parseSortByToSql(bansInMessage, sortBy))
      .limit(limit + 1);
    return getCursorPaginationData(readBans, limit, sortBy);
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
});
