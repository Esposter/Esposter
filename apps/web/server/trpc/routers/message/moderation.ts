import type { BanInRoom } from "#shared/models/db/room/BanInRoom";
import type { ModerationLogInRoom } from "#shared/models/db/room/ModerationLogInRoom";
import type { ModerationNoteInRoom } from "#shared/models/db/room/ModerationNoteInRoom";
import type { ModerationNoteInMessage, Page } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { useCallObject } from "#server/composables/realtime/useCallObject";
import { RoomMemberRemovalAction } from "#server/models/room/RoomMemberRemovalAction";
import { containsLike } from "#server/services/db/containsLike";
import { evictRoomCallParticipants } from "#server/services/message/call/evictRoomCallParticipants";
import { readRoomCallSessionIds } from "#server/services/message/call/readRoomCallSessionIds";
import { getRoomDisplayNameMap } from "#server/services/message/getRoomDisplayNameMap";
import { AdminActionPermissionMap } from "#server/services/message/moderation/AdminActionPermissionMap";
import { banRoomMember } from "#server/services/message/moderation/banRoomMember";
import { broadcastAdminAction } from "#server/services/message/moderation/broadcastAdminAction";
import { deleteUserMessagesInPages } from "#server/services/message/moderation/deleteUserMessagesInPages";
import { publishDeletedMessageFiles } from "#server/services/message/moderation/publishDeletedMessageFiles";
import { readModerationNotesCount } from "#server/services/message/moderation/readModerationNotesCount";
import { takeBackMentionCounts } from "#server/services/message/takeBackMentionCounts";
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
import { checkHasPermission, createPageSort, getPageOrderBy, getPageWhere, toPage } from "@esposter/db";
import {
  AdminActionType,
  BAN_PAGE_SORT,
  bansInMessage,
  DatabaseEntityType,
  getDisplayNameExpression,
  getPublicUserColumns,
  getTopic,
  MODERATION_LOG_PAGE_SORT,
  MODERATION_NOTE_PAGE_SORT,
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
          // Must not be lost. The purge is the member's messages in the room, tombstoned a page at a time, and the blobs
          // Those messages named are queued for deletion behind it, while each one's mention counts are taken back
          if (input.type === AdminActionType.SoftBan)
            await getResultAsync(async () => {
              const purgedMessages = await deleteUserMessagesInPages(roomId, targetUserId);
              await Promise.all([
                publishDeletedMessageFiles(roomId, purgedMessages),
                ...purgedMessages.map((message) =>
                  takeBackMentionCounts(ctx.db, roomId, { ...message, userId: targetUserId }),
                ),
              ]);
            }).match(noop, console.error);
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
              useCallObject(callSessionId).updatePresets({
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
  ).query<Page<BanInRoom>>(async ({ ctx, input: { cursor, filter, limit, roomId } }) => {
    // A ban has no id of its own: it is paged newest-first on creation, tied on the banned user, which with the room is its key
    const sort = createPageSort({ createdAt: bansInMessage.createdAt, userId: bansInMessage.userId }, BAN_PAGE_SORT);
    const wheres: (SQL | undefined)[] = [
      eq(bansInMessage.roomId, roomId),
      isNull(bansInMessage.deletedAt),
      getPageWhere(sort, cursor),
    ];
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
      .orderBy(...getPageOrderBy(sort, cursor))
      .limit(limit + 1);
    return toPage(bans, BAN_PAGE_SORT, cursor, limit);
  }),
  readModerationLog: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.ManageRoom, readModerationLogInputSchema, "roomId"),
    ({ input }) => [getTopic(TopicKind.Room, input.roomId)],
  ).query<Page<ModerationLogInRoom>>(
    async ({ ctx, input: { actorUserId, cursor, limit, roomId, targetUserId, type } }) => {
      const sort = createPageSort({ id: moderationLogsInMessage.id }, MODERATION_LOG_PAGE_SORT);
      const wheres: (SQL | undefined)[] = [eq(moderationLogsInMessage.roomId, roomId), getPageWhere(sort, cursor)];
      if (actorUserId) wheres.push(eq(moderationLogsInMessage.actorUserId, actorUserId));
      if (targetUserId) wheres.push(eq(moderationLogsInMessage.targetUserId, targetUserId));
      if (type) wheres.push(eq(moderationLogsInMessage.type, type));
      const logs = await ctx.db
        .select()
        .from(moderationLogsInMessage)
        .where(and(...wheres))
        .orderBy(...getPageOrderBy(sort, cursor))
        .limit(limit + 1);
      const page = toPage(logs, MODERATION_LOG_PAGE_SORT, cursor, limit);
      const displayNameMap = await getRoomDisplayNameMap(
        ctx.db,
        roomId,
        page.items.flatMap((item) => (item.actorUserId ? [item.actorUserId, item.targetUserId] : [item.targetUserId])),
      );
      return {
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
  ).query<Page<ModerationNoteInRoom>>(async ({ ctx, input: { cursor, limit, roomId, targetUserId } }) => {
    await assertIsManageable(ctx.db, ctx.user.id, targetUserId, roomId);

    const sort = createPageSort({ id: moderationNotesInMessage.id }, MODERATION_NOTE_PAGE_SORT);
    const notes = await ctx.db
      .select()
      .from(moderationNotesInMessage)
      .where(
        and(
          eq(moderationNotesInMessage.roomId, roomId),
          eq(moderationNotesInMessage.targetUserId, targetUserId),
          getPageWhere(sort, cursor),
        ),
      )
      .orderBy(...getPageOrderBy(sort, cursor))
      .limit(limit + 1);
    const page = toPage(notes, MODERATION_NOTE_PAGE_SORT, cursor, limit);
    const displayNameMap = await getRoomDisplayNameMap(
      ctx.db,
      roomId,
      page.items.flatMap(({ actorUserId }) => (actorUserId ? [actorUserId] : [])),
    );
    return {
      items: page.items.map((note) => ({
        ...note,
        // A note whose author's account is gone has no name to show
        actorDisplayName: note.actorUserId ? (displayNameMap.get(note.actorUserId) ?? "") : "",
      })),
      nextCursor: page.nextCursor,
    };
  }),
  readModerationNotesCount: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.KickMembers, readModerationNotesCountInputSchema, "roomId"),
    ({ input }) => [getTopic(TopicKind.Room, input.roomId)],
  ).query<number>(async ({ ctx, input: { roomId, targetUserId } }) => {
    await assertIsManageable(ctx.db, ctx.user.id, targetUserId, roomId);
    return readModerationNotesCount(ctx.db, roomId, targetUserId);
  }),
});
