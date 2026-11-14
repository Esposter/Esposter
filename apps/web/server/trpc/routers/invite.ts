import type { ReadInviteResult } from "#shared/models/db/room/ReadInviteResult";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { InviteInMessage, InviteInMessageWithCreator } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { checkIsUniqueViolation } from "#server/services/db/checkIsUniqueViolation";
import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { readMyInvite } from "#server/services/message/readMyInvite";
import { getCursorPaginationData } from "#server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "#server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "#server/services/pagination/sorting/parseSortByToSql";
import { MAX_INVITE_ID_RETRIES } from "#server/services/room/constants";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { assertIsRoomMiddleware } from "#server/trpc/middleware/assertIsRoomMiddleware";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "#server/trpc/procedure/room/getPermissionsProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { createInviteInputSchema } from "#shared/models/db/room/CreateInviteInput";
import { readInviteInputSchema } from "#shared/models/db/room/ReadInviteInput";
import { readRoomInvitesInputSchema } from "#shared/models/db/room/ReadRoomInvitesInput";
import { revokeInviteInputSchema } from "#shared/models/db/room/RevokeInviteInput";
import { ID_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { checkIsInviteUsable } from "#shared/services/room/invite/checkIsInviteUsable";
import { checkHasPermission } from "@esposter/db";
import {
  DatabaseEntityType,
  getPublicUserColumns,
  InviteInMessageRelations,
  invitesInMessage,
  PublicUserColumns,
  roomIdSchema,
  roomsInMessage,
  RoomPermission,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { generateSecretToken, getResultAsync, Operation } from "@esposter/shared";
import { and, eq, exists, getColumns, sql } from "drizzle-orm";

export const inviteRouter = router({
  createInvite: getPermissionsProcedure(RoomPermission.ManageInvites, createInviteInputSchema, "roomId")
    .use(assertIsRoomMiddleware)
    .mutation<InviteInMessageWithCreator>(async ({ ctx, input: { expireAfterMinutes, maxUses, roomId } }) => {
      const userId = ctx.getSessionPayload.user.id;
      // A paused room keeps its links and stops minting them too, otherwise it goes on handing out credentials
      // Nobody can use
      const { isInvitePaused } = await requireEntity(
        ctx.db.query.roomsInMessage.findFirst({ columns: { isInvitePaused: true }, where: { id: { eq: roomId } } }),
        DatabaseEntityType.Room,
        roomId,
      );
      if (isInvitePaused) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Invite, roomId);
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
      // The pause is checked by the statements themselves, so one committed after the check above refuses them too:
      // The old link stays and no new one is minted
      const roomIsOpen = exists(
        ctx.db
          .select({ _: sql`1` })
          .from(roomsInMessage)
          .where(and(eq(roomsInMessage.id, roomId), eq(roomsInMessage.isInvitePaused, false))),
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
                    expiresAt: sql`${sql.param(expiresAt, invitesInMessage.expiresAt)}`,
                    id: sql`${id}`,
                    maxUses: sql`${maxUses}`,
                    roomId: roomsInMessage.id,
                    userId: sql`${userId}`,
                  })
                  .from(roomsInMessage)
                  .where(and(eq(roomsInMessage.id, roomId), eq(roomsInMessage.isInvitePaused, false))),
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
  readInvite: standardAuthedProcedure
    .input(readInviteInputSchema)
    .query<ReadInviteResult | undefined>(async ({ ctx, input }) => {
      const invite = await ctx.db.query.invitesInMessage.findFirst({
        where: { id: { eq: input } },
        with: InviteInMessageRelations,
      });
      // Expired/exhausted invites behave exactly like unknown tokens — don't leak which
      if (!invite || !checkIsInviteUsable(invite)) return undefined;

      // The landing page shows how many are in the room, never who: the count is taken here, since the relation
      // Reads the room without its memberships
      const [membership, memberCount] = await Promise.all([
        ctx.db.query.usersToRoomsInMessage.findFirst({
          where: { roomId: { eq: invite.roomId }, userId: { eq: ctx.getSessionPayload.user.id } },
        }),
        ctx.db.$count(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, invite.roomId)),
      ]);
      return { ...invite, isMember: Boolean(membership), room: { ...invite.room, memberCount } };
    }),
  readMyInvite: getMemberProcedure(roomIdSchema, "roomId")
    .use(assertIsRoomMiddleware)
    .query<InviteInMessage | undefined>(({ ctx, input: { roomId } }) =>
      readMyInvite(ctx.db, ctx.getSessionPayload.user.id, roomId),
    ),
  readRoomInvites: getPermissionsProcedure(RoomPermission.ManageRoom, readRoomInvitesInputSchema, "roomId").query<
    CursorPaginationData<InviteInMessageWithCreator>
  >(async ({ ctx, input: { cursor, limit, roomId } }) => {
    const sortBy: SortItem<keyof InviteInMessage>[] = [ID_DESCENDING_SORT_ITEM];
    const wheres: (SQL | undefined)[] = [eq(invitesInMessage.roomId, roomId)];
    if (cursor) wheres.push(getCursorWhere(invitesInMessage, cursor, sortBy));

    const invites = await ctx.db
      .select({ ...getColumns(invitesInMessage), user: getPublicUserColumns(usersInAuth) })
      .from(invitesInMessage)
      .innerJoin(usersInAuth, eq(invitesInMessage.userId, usersInAuth.id))
      .where(and(...wheres))
      .orderBy(...parseSortByToSql(invitesInMessage, sortBy))
      .limit(limit + 1);
    // Expiry and exhaustion are decided by `checkIsInviteUsable` rather than by a second copy of it in SQL, so
    // The page is cut over every row and only then filtered: a batch of lapsed links narrows what this page shows
    // Without ending the walk, and the cursor still names the oldest row read rather than the oldest usable one
    const { hasMore, items, nextCursor } = getCursorPaginationData(invites, limit, sortBy);
    return { hasMore, items: items.filter((invite) => checkIsInviteUsable(invite)), nextCursor };
  }),
  revokeInvite: getMemberProcedure(revokeInviteInputSchema, "roomId").mutation<void>(
    async ({ ctx, input: { id, roomId } }) => {
      // A member revokes their own link; revoking anybody's is `ManageRoom`, not `ManageInvites`. The default
      // Role carries `ManageInvites` so that every member can mint a link at all, which makes it the wrong gate
      // For a control over other people's links
      const { user } = ctx.getSessionPayload;
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
    },
  ),
});
