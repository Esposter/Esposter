import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Context } from "@@/server/trpc/context";
import type { Clause } from "@esposter/azure";
import type { BanInMessage, BanInMessageWithRelations } from "@esposter/db-schema";

import { createModerationNoteInputSchema } from "#shared/models/db/moderation/CreateModerationNoteInput";
import { deleteBanInputSchema } from "#shared/models/db/moderation/DeleteBanInput";
import { executeAdminActionInputSchema } from "#shared/models/db/moderation/ExecuteAdminActionInput";
import { readBansInputSchema } from "#shared/models/db/moderation/ReadBansInput";
import { readModerationLogInputSchema } from "#shared/models/db/moderation/ReadModerationLogInput";
import { readModerationNotesCountInputSchema } from "#shared/models/db/moderation/ReadModerationNotesCountInput";
import { readModerationNotesInputSchema } from "#shared/models/db/moderation/ReadModerationNotesInput";
import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { CREATED_AT_DESCENDING_SORT_ITEM, MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { escapeLike } from "@@/server/services/db/escapeLike";
import { on } from "@@/server/services/events/on";
import { stopLiveKitScreenShare } from "@@/server/services/livekit/stopLiveKitScreenShare";
import { callSessionParticipantMap } from "@@/server/services/message/call/callSessionParticipantMap";
import { readCallSessionId } from "@@/server/services/message/call/readCallSessionId";
import { moderationEventEmitter } from "@@/server/services/message/events/moderationEventEmitter";
import { AdminActionPermissionMap } from "@@/server/services/message/moderation/AdminActionPermissionMap";
import { readModerationNotesCount } from "@@/server/services/message/moderation/readModerationNotesCount";
import { softDeleteRoomMessagesByUser } from "@@/server/services/message/moderation/softDeleteRoomMessagesByUser";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { readCursorPaginationDataAzureTable } from "@@/server/services/pagination/cursor/readCursorPaginationDataAzureTable";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { announceRoomMemberRemoval } from "@@/server/services/room/announceRoomMemberRemoval";
import { assertIsManageable } from "@@/server/services/room/rbac/assertIsManageable";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { assertIsRoomMiddleware } from "@@/server/trpc/middleware/userToRoom/assertIsRoomMiddleware";
import { moderationLogPlugin } from "@@/server/trpc/plugins/moderationLogPlugin";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { BinaryOperator, CompositeKeyPropertyNames, getTableNullClause } from "@esposter/azure";
import { checkHasPermission, createEntity } from "@esposter/db";
import {
  AdminActionType,
  AzureTable,
  bansInMessage,
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
import { and, eq, getColumns, ilike, isNull, SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// The membership row an admin action removes, times out, or replaces
const getRoomMembershipWhere = (roomId: string, userId: string) =>
  and(eq(usersToRoomsInMessage.userId, userId), eq(usersToRoomsInMessage.roomId, roomId));
// A ban revokes membership and records the ban in one commit — both the ban and the soft ban start here.
// The membership row comes back so the caller can announce the removal, which is not part of the commit
const banRoomMember = (db: Context["db"], actorUserId: string, roomId: string, targetUserId: string) =>
  db.transaction(async (tx) => {
    const [deletedMember] = await tx
      .delete(usersToRoomsInMessage)
      .where(getRoomMembershipWhere(roomId, targetUserId))
      .returning();
    await tx
      .insert(bansInMessage)
      .values({ bannedByUserId: actorUserId, roomId, userId: targetUserId })
      .onConflictDoNothing();
    return deletedMember;
  });

export const moderationRouter = router({
  createModerationNote: getPermissionsProcedure(
    RoomPermission.KickMembers,
    createModerationNoteInputSchema,
    "roomId",
  ).mutation<ModerationNoteEntity>(async ({ ctx, input: { note, roomId, targetUserId } }) => {
    const actorUserId = ctx.getSessionPayload.user.id;
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
  deleteBan: getPermissionsProcedure(RoomPermission.BanMembers, deleteBanInputSchema, "roomId").mutation<void>(
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
    // A direct message has no roles and no moderators — the pair block each other instead, so an admin action
    // Aimed at one is rejected before it can write a ban row and a log entry nothing will ever read
    .use(assertIsRoomMiddleware)
    .concat(moderationLogPlugin)
    .mutation<void>(async ({ ctx, input }) => {
      const { roomId, targetUserId } = input;
      const actorUserId = ctx.getSessionPayload.user.id;
      // Moderating yourself is not a hierarchy question, so the comparison never reaches it — an owner
      // Outranks themselves under every rule the comparison knows, and would be able to ban themselves out of
      // The room they own
      if (targetUserId === actorUserId)
        throw getInvalidOperationError(
          Operation.Update,
          DatabaseEntityType.UserToRoom,
          JSON.stringify({ roomId, targetUserId }),
        );

      const [isPermitted] = await Promise.all([
        checkHasPermission(ctx.db, actorUserId, roomId, AdminActionPermissionMap[input.type]),
        assertIsManageable(ctx.db, actorUserId, targetUserId, roomId),
      ]);
      if (!isPermitted) throw new TRPCError({ code: "UNAUTHORIZED" });

      const sessionId = ctx.getSessionPayload.session.id;

      switch (input.type) {
        case AdminActionType.CreateBan: {
          const deletedMember = await banRoomMember(ctx.db, actorUserId, roomId, targetUserId);
          if (deletedMember) await announceRoomMemberRemoval(ctx.db, deletedMember, actorUserId, sessionId, "banned");
          break;
        }
        case AdminActionType.ForceMute:
        case AdminActionType.ForceUnmute:
        case AdminActionType.KickFromCall:
          break;
        case AdminActionType.KickFromRoom: {
          const [deletedMember] = await ctx.db
            .delete(usersToRoomsInMessage)
            .where(getRoomMembershipWhere(roomId, targetUserId))
            .returning();
          if (deletedMember) await announceRoomMemberRemoval(ctx.db, deletedMember, actorUserId, sessionId, "kicked");
          break;
        }
        case AdminActionType.SoftBan: {
          const deletedMember = await banRoomMember(ctx.db, actorUserId, roomId, targetUserId);
          if (deletedMember) await announceRoomMemberRemoval(ctx.db, deletedMember, actorUserId, sessionId, "banned");
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

          const participantMap = callSessionParticipantMap.get(callSessionId);
          if (participantMap) await stopLiveKitScreenShare(callSessionId, participantMap, targetUserId);
          break;
        }
        case AdminActionType.TimeoutUser:
          await ctx.db
            .update(usersToRoomsInMessage)
            .set({ timeoutUntil: new Date(Date.now() + input.durationMs) })
            .where(getRoomMembershipWhere(roomId, targetUserId));
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
  >(async ({ ctx, input: { cursor, filter, limit, roomId } }) => {
    const sortBy: SortItem<keyof BanInMessage>[] = [CREATED_AT_DESCENDING_SORT_ITEM];
    const wheres: (SQL | undefined)[] = [eq(bansInMessage.roomId, roomId), isNull(bansInMessage.deletedAt)];
    if (cursor) wheres.push(getCursorWhere(bansInMessage, cursor, sortBy));
    // The join below already brings the banned user's name into scope, so the predicate costs nothing extra
    if (filter?.name) wheres.push(ilike(users.name, `%${escapeLike(filter.name)}%`));

    const bannedByUsers = alias(users, "bannedByUsers");
    const bans = await ctx.db
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
    return getCursorPaginationData(bans, limit, sortBy);
  }),
  readModerationLog: getPermissionsProcedure(RoomPermission.ManageRoom, readModerationLogInputSchema, "roomId").query<
    CursorPaginationData<ModerationLogEntity>
  >(async ({ input: { actorUserId, cursor, limit, roomId, targetUserId, type } }) => {
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
  }),
  readModerationNotes: getPermissionsProcedure(
    RoomPermission.KickMembers,
    readModerationNotesInputSchema,
    "roomId",
  ).query<CursorPaginationData<ModerationNoteEntity>>(
    async ({ ctx, input: { cursor, limit, roomId, targetUserId } }) => {
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
    },
  ),
  readModerationNotesCount: getPermissionsProcedure(
    RoomPermission.KickMembers,
    readModerationNotesCountInputSchema,
    "roomId",
  ).query<number>(async ({ ctx, input: { roomId, targetUserId } }) => {
    await assertIsManageable(ctx.db, ctx.getSessionPayload.user.id, targetUserId, roomId);
    return readModerationNotesCount(roomId, targetUserId);
  }),
});
