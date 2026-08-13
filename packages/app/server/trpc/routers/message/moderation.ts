import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Context } from "@@/server/trpc/context";
import type { BanInMessage, BanInMessageWithRelations, Clause } from "@esposter/db-schema";

import { countModerationNotesInputSchema } from "#shared/models/db/moderation/CountModerationNotesInput";
import { createModerationNoteInputSchema } from "#shared/models/db/moderation/CreateModerationNoteInput";
import { deleteBanInputSchema } from "#shared/models/db/moderation/DeleteBanInput";
import { executeAdminActionInputSchema } from "#shared/models/db/moderation/ExecuteAdminActionInput";
import { readBansInputSchema } from "#shared/models/db/moderation/ReadBansInput";
import { readModerationLogInputSchema } from "#shared/models/db/moderation/ReadModerationLogInput";
import { readModerationNotesInputSchema } from "#shared/models/db/moderation/ReadModerationNotesInput";
import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { on } from "@@/server/services/events/on";
import { stopLiveKitScreenShare } from "@@/server/services/livekit/stopLiveKitScreenShare";
import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { readCallSessionId } from "@@/server/services/message/call/readCallSessionId";
import { moderationEventEmitter } from "@@/server/services/message/events/moderationEventEmitter";
import { AdminActionPermissionMap } from "@@/server/services/message/moderation/AdminActionPermissionMap";
import { countModerationNotes } from "@@/server/services/message/moderation/countModerationNotes";
import { softDeleteRoomMessagesByUser } from "@@/server/services/message/moderation/softDeleteRoomMessagesByUser";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { readCursorPaginationDataAzureTable } from "@@/server/services/pagination/cursor/readCursorPaginationDataAzureTable";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { assertIsManageable } from "@@/server/services/room/rbac/assertIsManageable";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { moderationLogPlugin } from "@@/server/trpc/plugins/moderationLogPlugin";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { createEntity, getTableNullClause, hasPermission } from "@esposter/db";
import {
  AdminActionType,
  AzureTable,
  bansInMessage,
  BinaryOperator,
  CompositeKeyPropertyNames,
  DatabaseEntityType,
  getReverseTickedTimestamp,
  ModerationLogEntity,
  ModerationLogEntityPropertyNames,
  ModerationNoteEntity,
  ModerationNoteEntityPropertyNames,
  roomIdSchema,
  RoomPermission,
  users,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { exhaustiveGuard, getResultAsync, ItemMetadataPropertyNames, noop, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getColumns, isNull, SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// The membership row an admin action removes, times out, or replaces
const getRoomMembership = (roomId: string, userId: string) =>
  and(eq(usersToRoomsInMessage.userId, userId), eq(usersToRoomsInMessage.roomId, roomId));
// A ban revokes membership and records the ban in one commit — both the ban and the soft ban start here
const banRoomMember = (db: Context["db"], actorUserId: string, roomId: string, targetUserId: string) =>
  db.transaction(async (tx) => {
    await tx.delete(usersToRoomsInMessage).where(getRoomMembership(roomId, targetUserId));
    await tx
      .insert(bansInMessage)
      .values({ bannedByUserId: actorUserId, roomId, userId: targetUserId })
      .onConflictDoNothing();
  });

export const moderationRouter = router({
  countModerationNotes: getPermissionsProcedure(
    RoomPermission.KickMembers,
    countModerationNotesInputSchema,
    "roomId",
  ).query<number>(async ({ ctx, input: { roomId, targetUserId } }) => {
    await assertIsManageable(ctx.db, ctx.getSessionPayload.user.id, targetUserId, roomId);
    return countModerationNotes(roomId, targetUserId);
  }),
  createModerationNote: getPermissionsProcedure(
    RoomPermission.KickMembers,
    createModerationNoteInputSchema,
    "roomId",
  ).mutation<ModerationNoteEntity>(async ({ ctx, input: { note, roomId, targetUserId } }) => {
    const actorUserId = ctx.getSessionPayload.user.id;
    // Provisioning the table is independent of the hierarchy check, so neither waits on the other
    const [moderationNotesClient] = await Promise.all([
      useTableClient(AzureTable.ModerationNotes),
      assertIsManageable(ctx.db, actorUserId, targetUserId, roomId),
    ]);

    const moderationNoteEntity = new ModerationNoteEntity({
      actorUserId,
      note,
      partitionKey: roomId,
      rowKey: getReverseTickedTimestamp(),
      targetUserId,
    });
    await createEntity(moderationNotesClient, moderationNoteEntity);
    return moderationNoteEntity;
  }),
  // The delete's own returning() reports whether the ban existed, so there is no separate existence read to
  // Race against a concurrent unban
  deleteBan: getPermissionsProcedure(RoomPermission.BanMembers, deleteBanInputSchema, "roomId").mutation(
    async ({ ctx, input: { roomId, userId } }) => {
      requireMutation(
        (
          await ctx.db
            .delete(bansInMessage)
            .where(and(eq(bansInMessage.roomId, roomId), eq(bansInMessage.userId, userId)))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.Ban,
        userId,
      );
    },
  ),
  // oxlint-disable-next-line prefer-spread
  executeAdminAction: getMemberProcedure(executeAdminActionInputSchema, "roomId")
    .concat(moderationLogPlugin)
    .mutation(async ({ ctx, input }) => {
      const { roomId, targetUserId } = input;
      const actorUserId = ctx.getSessionPayload.user.id;
      const [isPermitted] = await Promise.all([
        hasPermission(ctx.db, actorUserId, roomId, AdminActionPermissionMap[input.type]),
        assertIsManageable(ctx.db, actorUserId, targetUserId, roomId),
      ]);
      if (!isPermitted) throw new TRPCError({ code: "UNAUTHORIZED" });

      switch (input.type) {
        case AdminActionType.CreateBan:
          await banRoomMember(ctx.db, actorUserId, roomId, targetUserId);
          break;
        case AdminActionType.ForceMute:
        case AdminActionType.ForceUnmute:
        case AdminActionType.KickFromCall:
          break;
        case AdminActionType.KickFromRoom:
          await ctx.db.delete(usersToRoomsInMessage).where(getRoomMembership(roomId, targetUserId));
          break;
        case AdminActionType.SoftBan: {
          await banRoomMember(ctx.db, actorUserId, roomId, targetUserId);
          // Best-effort after the ban commits: the ban is the effect that must not be lost, and rethrowing here
          // Would fail a mutation whose row already landed. Nothing re-runs the purge — re-issuing the ban hits
          // `onConflictDoNothing`, and there is no sweeper or retry queue — so a partial failure leaves some of
          // The banned user's messages visible until a moderator deletes them by hand. Accepted while the purge
          // Is a table scan the request path already owns; a durable version belongs on the event pipeline
          await getResultAsync(() => softDeleteRoomMessagesByUser(roomId, targetUserId)).match(noop, console.error);
          break;
        }
        case AdminActionType.StopScreenShare: {
          const callSessionId = await readCallSessionId(ctx.db, roomId);
          if (!callSessionId) break;

          const sessionMap = callSessionParticipantMap.get(callSessionId);
          if (sessionMap) await stopLiveKitScreenShare(callSessionId, sessionMap, targetUserId);
          break;
        }
        case AdminActionType.TimeoutUser:
          await ctx.db
            .update(usersToRoomsInMessage)
            .set({ timeoutUntil: new Date(Date.now() + input.durationMs) })
            .where(getRoomMembership(roomId, targetUserId));
          break;
        case AdminActionType.Warn:
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
  onAdminAction: getMemberProcedure(roomIdSchema, "roomId").subscription(async function* ({
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
    const sortBy: SortItem<keyof BanInMessage>[] = [
      { key: ItemMetadataPropertyNames.createdAt, order: SortOrder.Desc },
    ];
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
    async ({ input: { actorUserId, cursor, limit, roomId, targetUserId, type } }) => {
      const clauses: Clause<ModerationLogEntity>[] = [
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
        getTableNullClause(ItemMetadataPropertyNames.deletedAt),
      ];
      if (actorUserId)
        clauses.push({
          key: ModerationLogEntityPropertyNames.actorUserId,
          operator: BinaryOperator.eq,
          value: actorUserId,
        });
      if (targetUserId)
        clauses.push({
          key: ModerationLogEntityPropertyNames.targetUserId,
          operator: BinaryOperator.eq,
          value: targetUserId,
        });
      if (type) clauses.push({ key: ModerationLogEntityPropertyNames.type, operator: BinaryOperator.eq, value: type });

      const moderationLogClient = await useTableClient(AzureTable.ModerationLog);
      return readCursorPaginationDataAzureTable(moderationLogClient, ModerationLogEntity, {
        clauses,
        cursor,
        limit,
        sortBy: [MESSAGE_ROWKEY_SORT_ITEM],
      });
    },
  ),
  readModerationNotes: getPermissionsProcedure(
    RoomPermission.KickMembers,
    readModerationNotesInputSchema,
    "roomId",
  ).query(async ({ ctx, input: { cursor, limit, roomId, targetUserId } }) => {
    // Provisioning the table is independent of the hierarchy check, so neither waits on the other
    const [moderationNotesClient] = await Promise.all([
      useTableClient(AzureTable.ModerationNotes),
      assertIsManageable(ctx.db, ctx.getSessionPayload.user.id, targetUserId, roomId),
    ]);

    const clauses: Clause<ModerationNoteEntity>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
      { key: ModerationNoteEntityPropertyNames.targetUserId, operator: BinaryOperator.eq, value: targetUserId },
      getTableNullClause(ItemMetadataPropertyNames.deletedAt),
    ];
    return readCursorPaginationDataAzureTable(moderationNotesClient, ModerationNoteEntity, {
      clauses,
      cursor,
      limit,
      sortBy: [MESSAGE_ROWKEY_SORT_ITEM],
    });
  }),
});
