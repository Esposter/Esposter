import type { ReadInviteResult } from "#shared/models/db/room/ReadInviteResult";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { InviteInMessage, InviteInMessageWithCreator } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { checkIsUniqueViolation } from "#server/services/db/checkIsUniqueViolation";
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
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { checkIsInviteUsable } from "#shared/services/room/invite/checkIsInviteUsable";
import { createId } from "#shared/util/math/random/createId";
import { checkHasPermission } from "@esposter/db";
import {
  DatabaseEntityType,
  getPublicUserColumns,
  INVITE_ID_LENGTH,
  InviteInMessageRelations,
  invitesInMessage,
  PublicUserColumns,
  roomIdSchema,
  RoomPermission,
  roomsInMessage,
  usersInAuth,
} from "@esposter/db-schema";
import { getResultAsync, Operation, takeOne } from "@esposter/shared";
import { and, eq, getColumns } from "drizzle-orm";

export const inviteRouter = router({
  createInvite: getPermissionsProcedure(RoomPermission.ManageInvites, createInviteInputSchema, "roomId")
    .use(assertIsRoomMiddleware)
    .mutation<InviteInMessageWithCreator>(({ ctx, input: { expireAfterMinutes, maxUses, roomId } }) =>
      ctx.db.transaction(async (tx) => {
        // The room row is locked first, because the pause is a read with no constraint behind it: without the lock
        // A pause can commit between the check and the insert, and the room mints a link after it closed
        await tx
          .select({ id: roomsInMessage.id })
          .from(roomsInMessage)
          .where(eq(roomsInMessage.id, roomId))
          .for("update");
        // A paused room keeps its links and stops minting them too, otherwise it goes on handing out credentials
        // Nobody can use
        const { isInvitePaused } = await requireEntity(
          tx.query.roomsInMessage.findFirst({ columns: { isInvitePaused: true }, where: { id: { eq: roomId } } }),
          DatabaseEntityType.Room,
          roomId,
        );
        if (isInvitePaused) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Invite, roomId);
        // Timestamps have no empty value, so the 0 sentinel (never expires) maps to null here
        const expiresAt = expireAfterMinutes
          ? new Date(Date.now() + Temporal.Duration.from({ minutes: expireAfterMinutes }).total("milliseconds"))
          : null;
        // One invite per member per room — creating with new options replaces the old link
        await tx
          .delete(invitesInMessage)
          .where(and(eq(invitesInMessage.roomId, roomId), eq(invitesInMessage.userId, ctx.getSessionPayload.user.id)));
        // The creator rides back with the row because the management panel lists one column of them, and the
        // Session carries the auth user rather than this table's row
        const user = await requireEntity(
          tx.query.usersInAuth.findFirst({
            columns: PublicUserColumns,
            where: { id: { eq: ctx.getSessionPayload.user.id } },
          }),
          DatabaseEntityType.User,
          ctx.getSessionPayload.user.id,
        );

        for (let attempt = 0; attempt < MAX_INVITE_ID_RETRIES; attempt++) {
          const id = createId(INVITE_ID_LENGTH);
          // Each attempt is its own savepoint: a failed insert aborts the enclosing transaction, so a retry issued
          // Straight on it fails as "transaction aborted" rather than as another roll of the id. Only a collision
          // Is retried — anything else is the database itself, and re-rolling the id through it hides the report
          // oxlint-disable-next-line no-await-in-loop -- Retry: the next attempt rolls a new id only because this one collided
          const invite = await getResultAsync(() =>
            tx.transaction((savepoint) =>
              savepoint
                .insert(invitesInMessage)
                .values({ expiresAt, id, maxUses, roomId, userId: ctx.getSessionPayload.user.id })
                .returning(),
            ),
          ).match(
            (invites) => takeOne(invites),
            (error) => {
              if (checkIsUniqueViolation(error)) return undefined;
              throw error;
            },
          );
          if (invite) return { ...invite, user };
        }
        throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Invite, roomId, "UNPROCESSABLE_CONTENT");
      }),
    ),
  readInvite: standardAuthedProcedure
    .input(readInviteInputSchema)
    .query<ReadInviteResult | undefined>(async ({ ctx, input }) => {
      const invite = await ctx.db.query.invitesInMessage.findFirst({
        where: { id: { eq: input } },
        with: InviteInMessageRelations,
      });
      // Expired/exhausted invites behave exactly like unknown tokens — don't leak which
      if (!invite || !checkIsInviteUsable(invite)) return undefined;

      const membership = await ctx.db.query.usersToRoomsInMessage.findFirst({
        where: { roomId: { eq: invite.roomId }, userId: { eq: ctx.getSessionPayload.user.id } },
      });
      return { ...invite, isMember: Boolean(membership) };
    }),
  readMyInvite: getMemberProcedure(roomIdSchema, "roomId")
    .use(assertIsRoomMiddleware)
    .query<InviteInMessage | undefined>(({ ctx, input: { roomId } }) =>
      readMyInvite(ctx.db, ctx.getSessionPayload.user.id, roomId),
    ),
  readRoomInvites: getPermissionsProcedure(RoomPermission.ManageRoom, readRoomInvitesInputSchema, "roomId").query<
    CursorPaginationData<InviteInMessageWithCreator>
  >(async ({ ctx, input: { cursor, limit, roomId } }) => {
    const sortBy: SortItem<keyof InviteInMessage>[] = [CREATED_AT_DESCENDING_SORT_ITEM];
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
