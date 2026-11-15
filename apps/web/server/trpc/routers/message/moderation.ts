import type { BanInRoom } from "#shared/models/db/room/BanInRoom";
import type { ModerationLogInRoom } from "#shared/models/db/room/ModerationLogInRoom";
import type { ModerationNoteInRoom } from "#shared/models/db/room/ModerationNoteInRoom";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { BanInMessage, ModerationLogInMessage, ModerationNoteInMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { RoomMemberRemovalAction } from "#server/models/room/RoomMemberRemovalAction";
import { containsLike } from "#server/services/db/containsLike";
import { evictRoomCallParticipants } from "#server/services/message/call/evictRoomCallParticipants";
import { getCallObject } from "#server/services/message/call/getCallObject";
import { readRoomCallSessionIds } from "#server/services/message/call/readRoomCallSessionIds";
import { getRoomDisplayNameMap } from "#server/services/message/getRoomDisplayNameMap";
import { AdminActionPermissionMap } from "#server/services/message/moderation/AdminActionPermissionMap";
import { banRoomMember } from "#server/services/message/moderation/banRoomMember";
import { broadcastAdminAction } from "#server/services/message/moderation/broadcastAdminAction";
import { publishDeletedMessageFiles } from "#server/services/message/moderation/publishDeletedMessageFiles";
import { readModerationNotesCount } from "#server/services/message/moderation/readModerationNotesCount";
import { getCursorPaginationData } from "#server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "#server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "#server/services/pagination/sorting/parseSortByToSql";
import { announceRoomMemberRemoval } from "#server/services/room/announceRoomMemberRemoval";
import { getRoomListTopics } from "#server/services/room/getRoomListTopics";
import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { assertIsManageable } from "#server/services/room/rbac/assertIsManageable";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { assertIsRoomMiddleware } from "#server/trpc/middleware/assertIsRoomMiddleware";
import { moderationLogPlugin } from "#server/trpc/plugins/moderationLogPlugin";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "#server/trpc/procedure/room/getPermissionsProcedure";
import { createModerationNoteInputSchema } from "#shared/models/db/moderation/CreateModerationNoteInput";
import { deleteBanInputSchema } from "#shared/models/db/moderation/DeleteBanInput";
import { executeAdminActionInputSchema } from "#shared/models/db/moderation/ExecuteAdminActionInput";
import { readBansInputSchema } from "#shared/models/db/moderation/ReadBansInput";
import { readModerationLogInputSchema } from "#shared/models/db/moderation/ReadModerationLogInput";
import { readModerationNotesCountInputSchema } from "#shared/models/db/moderation/ReadModerationNotesCountInput";
import { readModerationNotesInputSchema } from "#shared/models/db/moderation/ReadModerationNotesInput";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { CREATED_AT_DESCENDING_SORT_ITEM, ID_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { checkHasPermission } from "@esposter/db";
import {
  AdminActionType,
  bansInMessage,
  DatabaseEntityType,
  getDisplayNameExpression,
  getPublicUserColumns,
  getTopic,
  moderationLogsInMessage,
  moderationNotesInMessage,
  PublishSource,
  RoomPermission,
  TopicKind,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { exhaustiveGuard, getResultAsync, noop, Operation, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getColumns, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

export const moderationRouter = router({
  createModerationNote: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.KickMembers, createModerationNoteInputSchema, "roomId"),
    ({ input }) => [getTopic(TopicKind.Room, input.roomId)],
  ).mutation<ModerationNoteInMessage>(async ({ ctx, input: { note, roomId, targetUserId } }) => {
    const actorUserId = ctx.user.id;
    await assertIsManageable(ctx.db, actorUserId, targetUserId, roomId);
    return takeOne(
      await ctx.db.insert(moderationNotesInMessage).values({ actorUserId, note, roomId, targetUserId }).returning(),
    );
  }),
  // The delete's own returning() reports whether the ban existed, so there is no separate existence read to
  // Race against a concurrent unban
  deleteBan: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.BanMembers, deleteBanInputSchema, "roomId"),
    ({ input }) => [getTopic(TopicKind.Room, input.roomId)],
  ).mutation<void>(async ({ ctx, input: { roomId, userId } }) => {
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
  }),
  // oxlint-disable-next-line prefer-spread -- `concat` is tRPC's procedure-builder merge, not an array's
  executeAdminAction: getTopicsProcedure(
    // A direct message has no roles and no moderators — the pair block each other instead, so an admin action
    // Aimed at one is rejected before it can write a ban row and a log entry nothing will ever read
    getMemberProcedure(executeAdminActionInputSchema, "roomId").use(assertIsRoomMiddleware),
    ({ input: { roomId, targetUserId } }) => [getTopic(TopicKind.Room, roomId), ...getRoomListTopics(targetUserId)],
  )
    // The topics publish after the log plugin, which runs inside them, has written its entry, so a reader refetching the
    // Room's log finds the entry the topic announced
    .concat(moderationLogPlugin)
    .mutation<void>(async ({ ctx, input }) => {
      const { roomId, targetUserId } = input;
      const actorUserId = ctx.user.id;
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
            await announceRoomMemberRemoval(ctx.db, deletedMember, actorUserId, RoomMemberRemovalAction.Banned);
          // A soft ban also purges what the member wrote — best-effort after the ban commits: the ban is the effect that
          // Must not be lost. The purge is one call to the member's room, which tombstones every message they wrote in one
          // Turn, and the blobs those messages named are queued for deletion behind it
          if (input.type === AdminActionType.SoftBan)
            await getResultAsync(async () =>
              publishDeletedMessageFiles(roomId, await useRoomObject(roomId).deleteUserMessages(targetUserId)),
            ).match(noop, console.error);
          await evictAfterRemoval();
          break;
        }
        // Enforced at RealtimeKit, since the targeted client applying the action to itself is only a courtesy — one that
        // Ignored it would keep talking or presenting
        case AdminActionType.ForceMute:
        case AdminActionType.ForceUnmute:
        case AdminActionType.StopScreenShare: {
          const sources =
            input.type === AdminActionType.StopScreenShare ? [PublishSource.Screenshare] : [PublishSource.Microphone];
          const callSessionIds = await readRoomCallSessionIds(ctx.db, roomId);
          await Promise.all(
            callSessionIds.map((callSessionId) =>
              getCallObject(callSessionId).updatePresets({
                callSessionId,
                isGranted: input.type === AdminActionType.ForceUnmute,
                sources,
                userId: targetUserId,
              }),
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
            await announceRoomMemberRemoval(ctx.db, deletedMember, actorUserId, RoomMemberRemovalAction.Kicked);
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

      await broadcastAdminAction(roomId, {
        durationMs: input.type === AdminActionType.TimeoutUser ? input.durationMs : undefined,
        targetUserId,
        type: input.type,
      });
    }),
  readBans: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.BanMembers, readBansInputSchema, "roomId"),
    ({ input }) => [getTopic(TopicKind.Room, input.roomId)],
  ).query<CursorPaginationData<BanInRoom>>(async ({ ctx, input: { cursor, filter, limit, roomId } }) => {
    // A ban has no id of its own: it is paged newest-first on creation, tied on the banned user, which with the room is its key
    const sortBy: SortItem<keyof BanInMessage>[] = [
      CREATED_AT_DESCENDING_SORT_ITEM,
      { key: "userId", order: SortOrder.Desc },
    ];
    const wheres: (SQL | undefined)[] = [eq(bansInMessage.roomId, roomId), isNull(bansInMessage.deletedAt)];
    if (cursor) wheres.push(getCursorWhere(bansInMessage, cursor, sortBy));
    // The join below already brings the banned user's name into scope, so the predicate costs nothing extra
    if (filter?.name) wheres.push(containsLike(usersInAuth.name, filter.name));

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
  readModerationLog: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.ManageRoom, readModerationLogInputSchema, "roomId"),
    ({ input }) => [getTopic(TopicKind.Room, input.roomId)],
  ).query<CursorPaginationData<ModerationLogInRoom>>(
    async ({ ctx, input: { actorUserId, cursor, limit, roomId, targetUserId, type } }) => {
      const sortBy: SortItem<keyof ModerationLogInMessage>[] = [ID_DESCENDING_SORT_ITEM];
      const wheres: (SQL | undefined)[] = [eq(moderationLogsInMessage.roomId, roomId)];
      if (actorUserId) wheres.push(eq(moderationLogsInMessage.actorUserId, actorUserId));
      if (targetUserId) wheres.push(eq(moderationLogsInMessage.targetUserId, targetUserId));
      if (type) wheres.push(eq(moderationLogsInMessage.type, type));
      if (cursor) wheres.push(getCursorWhere(moderationLogsInMessage, cursor, sortBy));
      const logs = await ctx.db
        .select()
        .from(moderationLogsInMessage)
        .where(and(...wheres))
        .orderBy(...parseSortByToSql(moderationLogsInMessage, sortBy))
        .limit(limit + 1);
      const page = getCursorPaginationData(logs, limit, sortBy);
      const displayNameMap = await getRoomDisplayNameMap(
        ctx.db,
        roomId,
        page.items.flatMap((item) => (item.actorUserId ? [item.actorUserId, item.targetUserId] : [item.targetUserId])),
      );
      return {
        hasMore: page.hasMore,
        items: page.items.map((item) => ({
          ...item,
          actorDisplayName: item.actorUserId ? (displayNameMap.get(item.actorUserId) ?? "") : "",
          targetDisplayName: displayNameMap.get(item.targetUserId) ?? "",
        })),
        nextCursor: page.nextCursor,
      };
    },
  ),
  readModerationNotes: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.KickMembers, readModerationNotesInputSchema, "roomId"),
    ({ input }) => [getTopic(TopicKind.Room, input.roomId)],
  ).query<CursorPaginationData<ModerationNoteInRoom>>(
    async ({ ctx, input: { cursor, limit, roomId, targetUserId } }) => {
      await assertIsManageable(ctx.db, ctx.user.id, targetUserId, roomId);

      const sortBy: SortItem<keyof ModerationNoteInMessage>[] = [ID_DESCENDING_SORT_ITEM];
      const wheres: (SQL | undefined)[] = [
        eq(moderationNotesInMessage.roomId, roomId),
        eq(moderationNotesInMessage.targetUserId, targetUserId),
      ];
      if (cursor) wheres.push(getCursorWhere(moderationNotesInMessage, cursor, sortBy));
      const notes = await ctx.db
        .select()
        .from(moderationNotesInMessage)
        .where(and(...wheres))
        .orderBy(...parseSortByToSql(moderationNotesInMessage, sortBy))
        .limit(limit + 1);
      const page = getCursorPaginationData(notes, limit, sortBy);
      const displayNameMap = await getRoomDisplayNameMap(
        ctx.db,
        roomId,
        page.items.flatMap(({ actorUserId }) => (actorUserId ? [actorUserId] : [])),
      );
      return {
        hasMore: page.hasMore,
        items: page.items.map((note) => ({
          ...note,
          // A note whose author's account is gone has no name to show
          actorDisplayName: note.actorUserId ? (displayNameMap.get(note.actorUserId) ?? "") : "",
        })),
        nextCursor: page.nextCursor,
      };
    },
  ),
  readModerationNotesCount: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.KickMembers, readModerationNotesCountInputSchema, "roomId"),
    ({ input }) => [getTopic(TopicKind.Room, input.roomId)],
  ).query<number>(async ({ ctx, input: { roomId, targetUserId } }) => {
    await assertIsManageable(ctx.db, ctx.user.id, targetUserId, roomId);
    return readModerationNotesCount(ctx.db, roomId, targetUserId);
  }),
});
