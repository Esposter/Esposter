import type { ReadInviteResult } from "#shared/models/db/room/ReadInviteResult";
import type { InviteInMessage, InviteInMessageWithCreator, Page } from "@esposter/db-schema";

import { checkIsUniqueViolation } from "#server/services/db/checkIsUniqueViolation";
import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { readMyInvite } from "#server/services/message/readMyInvite";
import { MAX_INVITE_ID_RETRIES } from "#server/services/room/constants";
import { getRoomListTopics } from "#server/services/room/getRoomListTopics";
import { resolveLiveInvite } from "#server/services/room/resolveLiveInvite";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { assertIsRoomMiddleware } from "#server/trpc/middleware/assertIsRoomMiddleware";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "#server/trpc/procedure/room/getPermissionsProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { createInviteInputSchema } from "#shared/models/db/room/CreateInviteInput";
import { readInviteInputSchema } from "#shared/models/db/room/ReadInviteInput";
import { readRoomInvitesInputSchema, ROOM_INVITE_PAGE_SORT } from "#shared/models/db/room/ReadRoomInvitesInput";
import { revokeInviteInputSchema } from "#shared/models/db/room/RevokeInviteInput";
import { checkIsInviteUsable } from "#shared/services/room/invite/checkIsInviteUsable";
import { checkHasPermission, createPageSort, getPageOrderBy, getPageWhere, toPage } from "@esposter/db";
import {
  DatabaseEntityType,
  getPublicUserColumns,
  getTopic,
  invitesInMessage,
  PublicUserColumns,
  roomIdSchema,
  RoomPermission,
  roomsInMessage,
  TopicKind,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { generateSecretToken, getResultAsync, Operation } from "@esposter/shared";
import { and, eq, exists, getColumns, sql } from "drizzle-orm";

export const inviteRouter = router({
  createInvite: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.ManageInvites, createInviteInputSchema, "roomId").use(
      assertIsRoomMiddleware,
    ),
    ({ input }) => [getTopic(TopicKind.Room, input.roomId)],
  ).mutation<InviteInMessageWithCreator>(async ({ ctx, input: { expireAfterMinutes, maxUses, roomId } }) => {
    const userId = ctx.user.id;
    // Timestamps have no empty value, so the 0 sentinel (never expires) maps to null here
    const expiresAt = expireAfterMinutes
      ? new Date(Date.now() + Temporal.Duration.from({ minutes: expireAfterMinutes }).total("milliseconds"))
      : null;
    // The creator rides back with the row because the management panel lists one column of them, and the
    // Session carries the auth user rather than this table's row
    const user = await requireEntity(
      ctx.db.query.usersInAuth.findFirst({ columns: PublicUserColumns, where: { id: { eq: userId } } }),
      DatabaseEntityType.User,
      userId,
    );
    // A paused room keeps its links and mints none, and the statements check the pause themselves, so a pause
    // Committed after the request began refuses them the same way: the old link stays and no new one is minted
    const roomIsOpenWhere = and(eq(roomsInMessage.id, roomId), eq(roomsInMessage.isInvitePaused, false));
    const roomIsOpen = exists(
      ctx.db
        .select({ _: sql`1` })
        .from(roomsInMessage)
        .where(roomIsOpenWhere),
    );

    for (let attempt = 0; attempt < MAX_INVITE_ID_RETRIES; attempt++) {
      const id = generateSecretToken();
      // Each attempt is one batch, so a collision refuses the whole batch and the old link comes back with it. Only a
      // Collision is retried — anything else is the database itself, and re-rolling the id through it hides the report
      // oxlint-disable-next-line no-await-in-loop -- Retry: the next attempt rolls a new id only because this one collided
      const invite = await getResultAsync(() =>
        ctx.db.batch([
          // One invite per member per room — creating with new options replaces the old link
          ctx.db
            .delete(invitesInMessage)
            .where(and(eq(invitesInMessage.roomId, roomId), eq(invitesInMessage.userId, userId), roomIsOpen)),
          ctx.db
            .insert(invitesInMessage)
            .select(
              ctx.db
                .select({
                  ...getInsertSelectMetadata(invitesInMessage),
                  expiresAt: sql`${sql.param(expiresAt, invitesInMessage.expiresAt)}`.as("expiresAt"),
                  id: sql`${id}`.as("id"),
                  maxUses: sql`${maxUses}`.as("maxUses"),
                  roomId: roomsInMessage.id,
                  userId: sql`${userId}`.as("userId"),
                })
                .from(roomsInMessage)
                .where(roomIsOpenWhere),
            )
            .returning(),
        ]),
      ).match(
        ([, invites]) => requireMutation(invites[0], Operation.Create, DatabaseEntityType.Invite, roomId),
        (error) => {
          if (checkIsUniqueViolation(error)) return undefined;
          throw error;
        },
      );
      if (invite) return { ...invite, user };
    }
    throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Invite, roomId, "UNPROCESSABLE_CONTENT");
  }),
  // The landing page reads the invite by its token and whether the caller is a member, which joining and leaving
  // Both change. The invite's id is its bearer secret, so no topic names it
  readInvite: getTopicsProcedure(standardAuthedProcedure.input(readInviteInputSchema), ({ ctx }) =>
    getRoomListTopics(ctx.user.id),
  ).query<ReadInviteResult | undefined>(async ({ ctx, input }) => {
    // An expired, exhausted, paused or banned link reads as an unknown token, so the landing page cannot tell them apart
    const invite = await resolveLiveInvite(ctx.db, input, ctx.user.id);
    if (!invite) return undefined;

    // The landing page shows the room's name and how many are in it, never who: the room is read by its name alone, and
    // The count is taken here, since the memberships are never read
    const [room, user, membership, memberCount] = await Promise.all([
      requireEntity(
        ctx.db.query.roomsInMessage.findFirst({ columns: { name: true }, where: { id: { eq: invite.roomId } } }),
        DatabaseEntityType.Room,
        invite.roomId,
      ),
      requireEntity(
        ctx.db.query.usersInAuth.findFirst({ columns: PublicUserColumns, where: { id: { eq: invite.userId } } }),
        DatabaseEntityType.User,
        invite.userId,
      ),
      ctx.db.query.usersToRoomsInMessage.findFirst({
        where: { roomId: { eq: invite.roomId }, userId: { eq: ctx.user.id } },
      }),
      ctx.db.$count(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, invite.roomId)),
    ]);
    return { ...invite, isMember: Boolean(membership), room: { memberCount, name: room.name }, user };
  }),
  readMyInvite: getTopicsProcedure(
    getMemberProcedure(roomIdSchema, "roomId").use(assertIsRoomMiddleware),
    ({ input }) => [getTopic(TopicKind.Room, input.roomId)],
  ).query<InviteInMessage | undefined>(({ ctx, input: { roomId } }) => readMyInvite(ctx.db, ctx.user.id, roomId)),
  readRoomInvites: getTopicsProcedure(
    getPermissionsProcedure(RoomPermission.ManageRoom, readRoomInvitesInputSchema, "roomId"),
    ({ input }) => [getTopic(TopicKind.Room, input.roomId)],
  ).query<Page<InviteInMessageWithCreator>>(async ({ ctx, input: { cursor, limit, roomId } }) => {
    const sort = createPageSort(
      { createdAt: invitesInMessage.createdAt, id: invitesInMessage.id },
      ROOM_INVITE_PAGE_SORT,
    );
    const invites = await ctx.db
      .select({ ...getColumns(invitesInMessage), user: getPublicUserColumns(usersInAuth) })
      .from(invitesInMessage)
      .innerJoin(usersInAuth, eq(invitesInMessage.userId, usersInAuth.id))
      .where(and(eq(invitesInMessage.roomId, roomId), getPageWhere(sort, cursor)))
      .orderBy(...getPageOrderBy(sort, cursor))
      .limit(limit + 1);
    // Expiry and exhaustion are decided by `checkIsInviteUsable` rather than by a second copy of it in SQL, so
    // The page is cut over every row and only then filtered: a batch of lapsed links narrows what this page shows
    // Without ending the walk, and the cursor still names the oldest row read rather than the oldest usable one
    const page = toPage(invites, ROOM_INVITE_PAGE_SORT, cursor, limit);
    return { items: page.items.filter((invite) => checkIsInviteUsable(invite)), nextCursor: page.nextCursor };
  }),
  revokeInvite: getTopicsProcedure(getMemberProcedure(revokeInviteInputSchema, "roomId"), ({ input }) => [
    getTopic(TopicKind.Room, input.roomId),
  ]).mutation<void>(async ({ ctx, input: { id, roomId } }) => {
    // A member revokes their own link; revoking anybody's is `ManageRoom`, not `ManageInvites`. The default
    // Role carries `ManageInvites` so that every member can mint a link at all, which makes it the wrong gate
    // For a control over other people's links
    const { user } = ctx;
    const isInviteManager = await checkHasPermission(ctx.db, user.id, roomId, RoomPermission.ManageRoom);
    const wheres = [eq(invitesInMessage.id, id), eq(invitesInMessage.roomId, roomId)];
    if (!isInviteManager) wheres.push(eq(invitesInMessage.userId, user.id));

    requireMutation(
      (
        await ctx.db
          .delete(invitesInMessage)
          .where(and(...wheres))
          .returning()
      )[0],
      Operation.Delete,
      DatabaseEntityType.Invite,
      id,
    );
  }),
});
