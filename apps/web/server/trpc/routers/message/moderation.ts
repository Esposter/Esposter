import type { BanInRoom } from "#shared/models/db/room/BanInRoom";
import type { ModerationLogInRoom } from "#shared/models/db/room/ModerationLogInRoom";
import type { ModerationNoteInRoom } from "#shared/models/db/room/ModerationNoteInRoom";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Clause } from "@esposter/azure";
import type { BanInMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { useTableClient } from "#server/composables/azure/table/useTableClient";
import { RoomMemberRemovalAction } from "#server/models/room/RoomMemberRemovalAction";
import { escapeLike } from "#server/services/db/escapeLike";
import { on } from "#server/services/events/on";
import { SCREEN_SHARE_TRACK_SOURCES } from "#server/services/livekit/constants";
import { updateLiveKitTrackSources } from "#server/services/livekit/updateLiveKitTrackSources";
import { evictRoomCallParticipants } from "#server/services/message/call/evictRoomCallParticipants";
import { readRoomCallParticipantMaps } from "#server/services/message/call/readRoomCallParticipantMaps";
import { moderationEventEmitter } from "#server/services/message/events/moderationEventEmitter";
import { getRoomDisplayNameMap } from "#server/services/message/getRoomDisplayNameMap";
import { AdminActionPermissionMap } from "#server/services/message/moderation/AdminActionPermissionMap";
import { banRoomMember } from "#server/services/message/moderation/banRoomMember";
import { publishSoftDeletedMessages } from "#server/services/message/moderation/publishSoftDeletedMessages";
import { readModerationNotesCount } from "#server/services/message/moderation/readModerationNotesCount";
import { getCursorPaginationData } from "#server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "#server/services/pagination/cursor/getCursorWhere";
import { readCursorPaginationDataAzureTable } from "#server/services/pagination/cursor/readCursorPaginationDataAzureTable";
import { parseSortByToSql } from "#server/services/pagination/sorting/parseSortByToSql";
import { announceRoomMemberRemoval } from "#server/services/room/announceRoomMemberRemoval";
import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { assertIsManageable } from "#server/services/room/rbac/assertIsManageable";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { assertIsRoomMiddleware } from "#server/trpc/middleware/assertIsRoomMiddleware";
import { moderationLogPlugin } from "#server/trpc/plugins/moderationLogPlugin";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "#server/trpc/procedure/room/getPermissionsProcedure";
import { createModerationNoteInputSchema } from "#shared/models/db/moderation/CreateModerationNoteInput";
import { deleteBanInputSchema } from "#shared/models/db/moderation/DeleteBanInput";
import { executeAdminActionInputSchema } from "#shared/models/db/moderation/ExecuteAdminActionInput";
import { readBansInputSchema } from "#shared/models/db/moderation/ReadBansInput";
import { readModerationLogInputSchema } from "#shared/models/db/moderation/ReadModerationLogInput";
import { readModerationNotesCountInputSchema } from "#shared/models/db/moderation/ReadModerationNotesCountInput";
import { readModerationNotesInputSchema } from "#shared/models/db/moderation/ReadModerationNotesInput";
import { CREATED_AT_DESCENDING_SORT_ITEM, MESSAGE_ROW_KEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { BinaryOperator } from "@esposter/azure";
import { checkHasPermission, createEntity, getLivePartitionClauses, softDeleteRoomMessagesByUser } from "@esposter/db";
import {
  AdminActionType,
  AzureTable,
  bansInMessage,
  DatabaseEntityType,
  getDisplayNameExpression,
  getPublicUserColumns,
  getReverseTickedTimestamp,
  ModerationLogEntity,
  ModerationLogEntityPropertyNames,
  ModerationNoteEntity,
  ModerationNoteEntityPropertyNames,
  roomIdSchema,
  RoomPermission,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { exhaustiveGuard, getResultAsync, noop, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getColumns, ilike, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { TrackSource } from "livekit-server-sdk";

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
  // oxlint-disable-next-line prefer-spread -- `concat` is tRPC's procedure-builder merge, not an array's
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
      // Being removed from a room, for good or for a while, takes the member out of its calls too. Best-effort
      // Behind the removal, which has already committed: a failed eviction costs one connection that outlives it,
      // Where rethrowing would fail a mutation whose effect already landed
      const evictAfterRemoval = () =>
        getResultAsync(() => evictRoomCallParticipants(ctx.db, roomId, targetUserId)).match(noop, console.error);

      switch (input.type) {
        case AdminActionType.CreateBan:
        case AdminActionType.SoftBan: {
          const deletedMember = await banRoomMember(ctx.db, actorUserId, roomId, targetUserId);
          if (deletedMember)
            await announceRoomMemberRemoval(
              ctx.db,
              deletedMember,
              actorUserId,
              sessionId,
              RoomMemberRemovalAction.Banned,
            );
          // A soft ban also purges what the member wrote — best-effort after the ban commits: the ban is the effect
          // That must not be lost, and rethrowing here would fail a mutation whose row already landed. Nothing
          // Re-runs the purge — re-issuing the ban hits `onConflictDoNothing`, and there is no sweeper or retry
          // Queue — so a partial failure leaves some of the banned user's messages visible until a moderator
          // Deletes them by hand. Accepted while the purge is a table scan the request path already owns; a
          // Durable version belongs on the event pipeline
          if (input.type === AdminActionType.SoftBan)
            await getResultAsync(async () => {
              const messageClient = await useTableClient(AzureTable.Messages);
              await softDeleteRoomMessagesByUser(messageClient, roomId, targetUserId, (batch) =>
                publishSoftDeletedMessages(roomId, batch),
              );
            }).match(noop, console.error);
          await evictAfterRemoval();
          break;
        }
        // Enforced at the SFU, since the targeted client applying the action to itself is only a courtesy — one that
        // Ignored it would keep talking or presenting
        case AdminActionType.ForceMute:
        case AdminActionType.ForceUnmute:
        case AdminActionType.StopScreenShare: {
          const sources =
            input.type === AdminActionType.StopScreenShare ? SCREEN_SHARE_TRACK_SOURCES : [TrackSource.MICROPHONE];
          const roomCallParticipantMaps = await readRoomCallParticipantMaps(ctx.db, roomId);
          await Promise.all(
            roomCallParticipantMaps.map(([callSessionId, participantMap]) =>
              updateLiveKitTrackSources(
                callSessionId,
                participantMap,
                targetUserId,
                sources,
                input.type === AdminActionType.ForceUnmute,
              ),
            ),
          );
          break;
        }
        case AdminActionType.KickFromCall:
          await evictRoomCallParticipants(ctx.db, roomId, targetUserId);
          break;
        case AdminActionType.KickFromRoom: {
          const [deletedMember] = await ctx.db
            .delete(usersToRoomsInMessage)
            .where(getRoomMembershipWhere(roomId, targetUserId))
            .returning();
          if (deletedMember)
            await announceRoomMemberRemoval(
              ctx.db,
              deletedMember,
              actorUserId,
              sessionId,
              RoomMemberRemovalAction.Kicked,
            );
          await evictAfterRemoval();
          break;
        }
        case AdminActionType.TimeoutUser:
          await ctx.db
            .update(usersToRoomsInMessage)
            .set({ timeoutUntil: new Date(Date.now() + input.durationMs) })
            .where(getRoomMembershipWhere(roomId, targetUserId));
          await evictAfterRemoval();
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
    CursorPaginationData<BanInRoom>
  >(async ({ ctx, input: { cursor, filter, limit, roomId } }) => {
    const sortBy: SortItem<keyof BanInMessage>[] = [CREATED_AT_DESCENDING_SORT_ITEM];
    const wheres: (SQL | undefined)[] = [eq(bansInMessage.roomId, roomId), isNull(bansInMessage.deletedAt)];
    if (cursor) wheres.push(getCursorWhere(bansInMessage, cursor, sortBy));
    // The join below already brings the banned user's name into scope, so the predicate costs nothing extra
    if (filter?.name) wheres.push(ilike(usersInAuth.name, `%${escapeLike(filter.name)}%`));

    const bannedByUsers = alias(usersInAuth, "bannedByUsers");
    const bannedByMemberships = alias(usersToRoomsInMessage, "bannedByMemberships");
    const userMemberships = alias(usersToRoomsInMessage, "userMemberships");
    const bannedUserFieldColumnMap = {
      ...getPublicUserColumns(bannedByUsers),
      displayName: getDisplayNameExpression(bannedByMemberships, bannedByUsers),
    };
    const bans = await ctx.db
      .select({
        ...getColumns(bansInMessage),
        bannedByUser: bannedUserFieldColumnMap,
        user: {
          ...getPublicUserColumns(usersInAuth),
          displayName: getDisplayNameExpression(userMemberships, usersInAuth),
        },
      })
      .from(bansInMessage)
      .innerJoin(usersInAuth, eq(bansInMessage.userId, usersInAuth.id))
      .leftJoin(userMemberships, and(eq(userMemberships.userId, usersInAuth.id), eq(userMemberships.roomId, roomId)))
      .leftJoin(bannedByUsers, eq(bansInMessage.bannedByUserId, bannedByUsers.id))
      .leftJoin(
        bannedByMemberships,
        and(eq(bannedByMemberships.userId, bannedByUsers.id), eq(bannedByMemberships.roomId, roomId)),
      )
      .where(and(...wheres))
      .orderBy(...parseSortByToSql(bansInMessage, sortBy))
      .limit(limit + 1);
    return getCursorPaginationData(bans, limit, sortBy);
  }),
  readModerationLog: getPermissionsProcedure(RoomPermission.ManageRoom, readModerationLogInputSchema, "roomId").query<
    CursorPaginationData<ModerationLogInRoom>
  >(async ({ ctx, input: { actorUserId, cursor, limit, roomId, targetUserId, type } }) => {
    const clauses = getLivePartitionClauses<ModerationLogEntity>(roomId);
    if (actorUserId)
      clauses.push({
        key: ModerationLogEntityPropertyNames.actorUserId,
        operator: BinaryOperator.Eq,
        value: actorUserId,
      });
    if (targetUserId)
      clauses.push({
        key: ModerationLogEntityPropertyNames.targetUserId,
        operator: BinaryOperator.Eq,
        value: targetUserId,
      });
    if (type) clauses.push({ key: ModerationLogEntityPropertyNames.type, operator: BinaryOperator.Eq, value: type });

    const moderationLogClient = await useTableClient(AzureTable.ModerationLog);
    const page = await readCursorPaginationDataAzureTable(moderationLogClient, ModerationLogEntity, {
      clauses,
      cursor,
      limit,
      sortBy: [MESSAGE_ROW_KEY_SORT_ITEM],
    });
    const displayNameMap = await getRoomDisplayNameMap(
      ctx.db,
      roomId,
      page.items.flatMap((item) => [item.actorUserId, item.targetUserId]),
    );
    return {
      // oxlint-disable-next-line typescript/no-misused-spread -- the page is plain data, so the entity's class prototype is meant to go
      ...page,
      items: page.items.map((item) => ({
        // oxlint-disable-next-line typescript/no-misused-spread -- the item is plain data, so the entity's class prototype is meant to go
        ...item,
        actorDisplayName: displayNameMap.get(item.actorUserId) ?? "",
        targetDisplayName: displayNameMap.get(item.targetUserId) ?? "",
      })),
    };
  }),
  readModerationNotes: getPermissionsProcedure(
    RoomPermission.KickMembers,
    readModerationNotesInputSchema,
    "roomId",
  ).query<CursorPaginationData<ModerationNoteInRoom>>(
    async ({ ctx, input: { cursor, limit, roomId, targetUserId } }) => {
      const [moderationNotesClient] = await Promise.all([
        useTableClient(AzureTable.ModerationNotes),
        assertIsManageable(ctx.db, ctx.getSessionPayload.user.id, targetUserId, roomId),
      ]);

      const clauses: Clause<ModerationNoteEntity>[] = [
        ...getLivePartitionClauses<ModerationNoteEntity>(roomId),
        { key: ModerationNoteEntityPropertyNames.targetUserId, operator: BinaryOperator.Eq, value: targetUserId },
      ];
      const page = await readCursorPaginationDataAzureTable(moderationNotesClient, ModerationNoteEntity, {
        clauses,
        cursor,
        limit,
        sortBy: [MESSAGE_ROW_KEY_SORT_ITEM],
      });
      const displayNameMap = await getRoomDisplayNameMap(
        ctx.db,
        roomId,
        page.items.map(({ actorUserId }) => actorUserId),
      );
      return {
        // oxlint-disable-next-line typescript/no-misused-spread -- the page is plain data, so the entity's class prototype is meant to go
        ...page,
        // oxlint-disable-next-line typescript/no-misused-spread -- each note is a new plain object copied from the read row
        items: page.items.map((note) => ({ ...note, actorDisplayName: displayNameMap.get(note.actorUserId) ?? "" })),
      };
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
