import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { ReadInviteResult } from "#shared/models/db/room/ReadInviteResult";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { InviteInMessage, InviteInMessageWithCreator, RoomInMessage, User } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { createInviteInputSchema } from "#shared/models/db/room/CreateInviteInput";
import { createRoomInputSchema } from "#shared/models/db/room/CreateRoomInput";
import { deleteRoomInputSchema } from "#shared/models/db/room/DeleteRoomInput";
import { joinRoomInputSchema } from "#shared/models/db/room/JoinRoomInput";
import { leaveRoomInputSchema } from "#shared/models/db/room/LeaveRoomInput";
import { readRoomInvitesInputSchema } from "#shared/models/db/room/ReadRoomInvitesInput";
import { revokeInviteInputSchema } from "#shared/models/db/room/RevokeInviteInput";
import { updateRoomInputSchema } from "#shared/models/db/room/UpdateRoomInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { checkIsInviteUsable } from "#shared/services/room/invite/checkIsInviteUsable";
import { createId } from "#shared/util/math/random/createId";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { checkIsSameDevice } from "@@/server/services/auth/checkIsSameDevice";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { escapeLike } from "@@/server/services/db/escapeLike";
import { on } from "@@/server/services/events/on";
import { createSystemRoomMessage } from "@@/server/services/message/createSystemRoomMessage";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { readMyInvite } from "@@/server/services/message/readMyInvite";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { assertIsRoom } from "@@/server/services/room/assertIsRoom";
import { deleteRoom } from "@@/server/services/room/deleteRoom";
import { getRoomProfileImageBlobPrefix } from "@@/server/services/room/getRoomProfileImageBlobPrefix";
import { listRoomProfileImageBlobNames } from "@@/server/services/room/listRoomProfileImageBlobNames";
import { router } from "@@/server/trpc";
import { getForbiddenError } from "@@/server/trpc/guards/getForbiddenError";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { addProfanityFilterMiddleware } from "@@/server/trpc/middleware/addProfanityFilterMiddleware";
import { assertIsMember } from "@@/server/trpc/middleware/userToRoom/assertIsMember";
import { assertIsRoomMiddleware } from "@@/server/trpc/middleware/userToRoom/assertIsRoomMiddleware";
import { getProfanityFilterProcedure } from "@@/server/trpc/procedure/getProfanityFilterProcedure";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { categoryRouter } from "@@/server/trpc/routers/room/category";
import { directMessageRouter } from "@@/server/trpc/routers/room/directMessage";
import { roomEmojiRouter } from "@@/server/trpc/routers/room/emoji";
import { filterRouter } from "@@/server/trpc/routers/room/filter";
import { checkHasPermission, generateWriteSasUrl } from "@esposter/db";
import {
  AzureContainer,
  DatabaseEntityType,
  INVITE_ID_LENGTH,
  InviteInMessageRelations,
  invitesInMessage,
  refineRoomSchema,
  roomIdSchema,
  roomIdsSchema,
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  RoomType,
  selectInviteInMessageSchema,
  selectRoomInMessageSchema,
  selectUserSchema,
  userIdSchema,
  userIdsSchema,
  users,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
  UserToRoomInMessageRelations,
  WRITE_SAS_DURATION_MS,
} from "@esposter/db-schema";
import {
  getResultAsync,
  InvalidOperationError,
  ItemMetadataPropertyNames,
  MAX_READ_LIMIT,
  noop,
  Operation,
  takeOne,
} from "@esposter/shared";
import { mergeRouters } from "@trpc/server/unstable-core-do-not-import";
import { and, count, desc, eq, getColumns, gt, ilike, inArray, isNull, lt, ne, not, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";

const readRoomInputSchema = selectRoomInMessageSchema.shape.id.optional();

const readRoomsInputSchema = z
  .object({
    roomId: selectRoomInMessageSchema.shape.id.optional(),
    ...createCursorPaginationParamsSchema(selectRoomInMessageSchema.keyof(), [
      { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
    ]).shape,
    filter: refineRoomSchema(selectRoomInMessageSchema.pick({ name: true })).optional(),
  })
  .prefault({});
// The rooms a client subscribes to at once — a subscription with no room to watch has nothing to yield
const roomIdsInputSchema = roomIdsSchema.shape.roomIds.min(1);
// Invite ids are short enough to collide, so a create re-rolls before giving up
const MAX_INVITE_ID_RETRIES = 3;

const readMembersInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(selectUserSchema.keyof(), [
    { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
  ]).shape,
  filter: selectUserSchema.pick({ name: true }).optional(),
});
const readMembersByIdsInputSchema = z.object({
  ...roomIdSchema.shape,
  ids: userIdsSchema.shape.userIds.min(1),
});

const readInviteInputSchema = selectInviteInMessageSchema.shape.id;

export const baseRoomRouter = router({
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
          tx.query.users.findFirst({ where: { id: { eq: ctx.getSessionPayload.user.id } } }),
          DatabaseEntityType.User,
          ctx.getSessionPayload.user.id,
        );

        for (let i = 0; i < MAX_INVITE_ID_RETRIES; i++) {
          const id = createId(INVITE_ID_LENGTH);
          const invites = await getResultAsync(() =>
            tx
              .insert(invitesInMessage)
              .values({ expiresAt, id, maxUses, roomId, userId: ctx.getSessionPayload.user.id })
              .returning(),
          ).unwrapOr(undefined);
          if (invites) return { ...takeOne(invites), user };
        }
        throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Invite, roomId, "UNPROCESSABLE_CONTENT");
      }),
    ),
  createRoom: getProfanityFilterProcedure(createRoomInputSchema, ["name"]).mutation<RoomInMessage>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const newRoom = requireMutation(
        (
          await tx
            .insert(roomsInMessage)
            .values({ ...input, userId: ctx.getSessionPayload.user.id })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.Room,
        JSON.stringify(input),
      );

      await Promise.all([
        tx.insert(usersToRoomsInMessage).values({ roomId: newRoom.id, userId: ctx.getSessionPayload.user.id }),
        tx.insert(roomRolesInMessage).values({
          isEveryone: true,
          name: "@everyone",
          permissions:
            RoomPermission.ReadMessages |
            RoomPermission.SendMessages |
            RoomPermission.MentionEveryone |
            RoomPermission.ManageInvites,
          position: 0,
          roomId: newRoom.id,
        }),
      ]);
      return newRoom;
    }),
  ),
  deleteRoom: standardAuthedProcedure
    .input(deleteRoomInputSchema)
    .mutation<RoomInMessage>(({ ctx, input }) => deleteRoom(ctx.db, ctx.getSessionPayload, input)),
  generateProfileImageUploadUrl: getPermissionsProcedure(RoomPermission.ManageRoom, roomIdSchema, "roomId").mutation<{
    publicUrl: string;
    sasUrl: string;
  }>(async ({ input: { roomId } }) => {
    const containerClient = await useContainerClient(AzureContainer.PublicUserAssets);
    // A unique segment per upload so a re-upload never lands on a prior blob name — that is what lets the cleanup
    // On image change (below) delete stale versions without a delayed delete ever removing a freshly uploaded one
    const blobName = `${getRoomProfileImageBlobPrefix(roomId)}/${crypto.randomUUID()}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const sasUrl = await generateWriteSasUrl(blockBlobClient);
    return { publicUrl: blockBlobClient.url, sasUrl };
  }),
  joinRoom: standardAuthedProcedure.input(joinRoomInputSchema).mutation<RoomInMessage>(async ({ ctx, input }) => {
    const { roomId, roomInMessage, user } = await ctx.db.transaction(async (tx) => {
      // The room the token names is read and locked before a use is consumed, and the lock is held through the
      // Membership insert: a pause committing between the check below and that insert would otherwise let one more
      // Member in through a link the room had already closed
      const invitedRoom = await requireEntity(
        tx.query.invitesInMessage.findFirst({
          columns: { roomId: true },
          where: { id: { eq: input } },
        }),
        DatabaseEntityType.Invite,
        input,
      );

      await tx
        .select({ id: roomsInMessage.id })
        .from(roomsInMessage)
        .where(eq(roomsInMessage.id, invitedRoom.roomId))
        .for("update");
      // Usability check + use consumption in one statement so two concurrent joins can't both
      // Consume the last use. Expired/exhausted invites get the same error as unknown tokens.
      const [invite] = await tx
        .update(invitesInMessage)
        .set({ uses: sql`${invitesInMessage.uses} + 1` })
        .where(
          and(
            eq(invitesInMessage.id, input),
            or(isNull(invitesInMessage.expiresAt), gt(invitesInMessage.expiresAt, new Date())),
            or(eq(invitesInMessage.maxUses, 0), lt(invitesInMessage.uses, invitesInMessage.maxUses)),
          ),
        )
        .returning({ roomId: invitesInMessage.roomId });
      if (!invite) throw getNotFoundError(DatabaseEntityType.Invite, input);

      await assertIsRoom(tx, invite.roomId);

      const { isInvitePaused } = await requireEntity(
        tx.query.roomsInMessage.findFirst({
          columns: { isInvitePaused: true },
          where: { id: { eq: invite.roomId } },
        }),
        DatabaseEntityType.Room,
        invite.roomId,
      );
      // A paused room answers a live link exactly as it answers an unknown one — the use the statement above
      // Consumed rolls back with the transaction, so pausing costs the link nothing
      if (isInvitePaused) throw getNotFoundError(DatabaseEntityType.Invite, input);

      const ban = await tx.query.bansInMessage.findFirst({
        columns: { userId: true },
        where: {
          deletedAt: { isNull: true },
          roomId: { eq: invite.roomId },
          userId: { eq: ctx.getSessionPayload.user.id },
        },
      });
      if (ban) throw getForbiddenError("You are banned from this room");

      const userToRoom = requireMutation(
        (
          await tx
            .insert(usersToRoomsInMessage)
            .values({ roomId: invite.roomId, userId: ctx.getSessionPayload.user.id })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.UserToRoom,
        JSON.stringify({ roomId: invite.roomId, userId: ctx.getSessionPayload.user.id }),
      );
      const userToRoomWithRelations = await requireEntity(
        tx.query.usersToRoomsInMessage.findFirst({
          where: { roomId: { eq: userToRoom.roomId }, userId: { eq: userToRoom.userId } },
          with: UserToRoomInMessageRelations,
        }),
        DatabaseEntityType.UserToRoom,
        JSON.stringify(userToRoom),
      );
      const { roomId: joinedRoomId, roomInMessage: joinedRoomInMessage, user: joinedUser } = userToRoomWithRelations;
      return { roomId: joinedRoomId, roomInMessage: joinedRoomInMessage, user: joinedUser };
    });

    roomEventEmitter.emit("joinRoom", { roomId, sessionId: ctx.getSessionPayload.session.id, user });
    await createSystemRoomMessage(roomId, user.id, `${user.name} joined the room.`, ctx.getSessionPayload.session.id);

    return roomInMessage;
  }),
  leaveRoom: standardAuthedProcedure
    .input(leaveRoomInputSchema)
    .use(assertIsRoomMiddleware)
    .mutation<RoomInMessage["id"]>(async ({ ctx, input }) => {
      const userId = ctx.getSessionPayload.user.id;
      const ownedRoom = await ctx.db.query.roomsInMessage.findFirst({
        columns: { id: true },
        where: { id: { eq: input }, userId: { eq: userId } },
      });

      if (ownedRoom) {
        const { id } = await deleteRoom(ctx.db, ctx.getSessionPayload, input);
        return id;
      }

      const userToRoom = requireMutation(
        (
          await ctx.db
            .delete(usersToRoomsInMessage)
            .where(and(eq(usersToRoomsInMessage.roomId, input), eq(usersToRoomsInMessage.userId, userId)))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.UserToRoom,
        input,
      );

      roomEventEmitter.emit("leaveRoom", { ...userToRoom, sessionId: ctx.getSessionPayload.session.id });
      // Best-effort after the membership delete — the name lookup only exists to word the system message, so
      // A failure costs the room one "X left" line, never the leave that already landed.
      await getResultAsync(async () => {
        const leavingMember = await ctx.db.query.users.findFirst({
          columns: { name: true },
          where: { id: { eq: userId } },
        });
        if (leavingMember)
          await createSystemRoomMessage(
            userToRoom.roomId,
            userId,
            `${leavingMember.name} left the room.`,
            ctx.getSessionPayload.session.id,
          );
      }).match(noop, console.error);

      return userToRoom.roomId;
    }),
  onDeleteRoom: standardAuthedProcedure.input(roomIdsInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await assertIsMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ roomId, sessionId, userId }] of on(roomEventEmitter, "deleteRoom", { signal })) {
      if (!input.includes(roomId) || checkIsSameDevice({ sessionId, userId }, ctx.getSessionPayload)) continue;
      yield roomId;
    }
  }),
  onJoinRoom: standardAuthedProcedure.input(roomIdsInputSchema).subscription(async function* ({ ctx, input, signal }) {
    await assertIsMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ roomId, sessionId, user }] of on(roomEventEmitter, "joinRoom", { signal })) {
      if (!input.includes(roomId) || checkIsSameDevice({ sessionId, userId: user.id }, ctx.getSessionPayload)) continue;
      // One subscription spans every room the client is in, so the room the event happened in travels with it.
      // Dropping it leaves the client to infer which room a join belongs to, and the only thing it can infer
      // From is the room that happens to be open
      yield { roomId, user };
    }
  }),
  onLeaveRoom: standardAuthedProcedure.input(roomIdsInputSchema).subscription(async function* ({ ctx, input, signal }) {
    await assertIsMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ roomId, sessionId, userId }] of on(roomEventEmitter, "leaveRoom", { signal })) {
      if (!input.includes(roomId) || checkIsSameDevice({ sessionId, userId }, ctx.getSessionPayload)) continue;
      // Yielded with its room for the same reason a join is: a departure applied to the room the user happens
      // To be looking at removes a member who never left it
      yield { roomId, userId };
    }
  }),
  onUpdateRoom: standardAuthedProcedure.input(roomIdsInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await assertIsMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [data] of on(roomEventEmitter, "updateRoom", { signal })) {
      if (!input.includes(data.id)) continue;
      yield data;
    }
  }),
  readInvite: standardAuthedProcedure
    .input(readInviteInputSchema)
    .query<null | ReadInviteResult>(async ({ ctx, input }) => {
      const invite = await ctx.db.query.invitesInMessage.findFirst({
        where: { id: { eq: input } },
        with: InviteInMessageRelations,
      });
      // Expired/exhausted invites behave exactly like unknown tokens — don't leak which
      if (!invite || !checkIsInviteUsable(invite)) return null;

      const membership = await ctx.db.query.usersToRoomsInMessage.findFirst({
        where: {
          roomId: {
            eq: invite.roomId,
          },
          userId: {
            eq: ctx.getSessionPayload.user.id,
          },
        },
      });
      return { ...invite, isMember: Boolean(membership) };
    }),
  readMemberCountsByTopRole: getMemberProcedure(roomIdSchema, "roomId").query<MemberCountByTopRole[]>(
    ({ ctx, input: { roomId } }) => {
      // A member's top role is their highest-positioned assigned role; @everyone is implicit and never groups
      const topRoles = ctx.db
        .selectDistinctOn([usersToRoomRolesInMessage.userId], {
          roleId: usersToRoomRolesInMessage.roleId,
          userId: usersToRoomRolesInMessage.userId,
        })
        .from(usersToRoomRolesInMessage)
        .innerJoin(
          roomRolesInMessage,
          and(eq(roomRolesInMessage.id, usersToRoomRolesInMessage.roleId), not(roomRolesInMessage.isEveryone)),
        )
        .where(eq(usersToRoomRolesInMessage.roomId, roomId))
        .orderBy(usersToRoomRolesInMessage.userId, desc(roomRolesInMessage.position))
        .as("topRoles");
      // Only role groups are returned — the roleless trailing group is derived client-side from the
      // Total member count so join/leave subscription updates keep it current without a refetch
      return ctx.db.select({ count: count(), roleId: topRoles.roleId }).from(topRoles).groupBy(topRoles.roleId);
    },
  ),
  readMembers: getMemberProcedure(readMembersInputSchema, "roomId").query<CursorPaginationData<User>>(
    async ({ ctx, input: { cursor, filter, limit, roomId, sortBy } }) => {
      const wheres: (SQL | undefined)[] = [eq(usersToRoomsInMessage.roomId, roomId)];
      if (cursor) wheres.push(getCursorWhere(users, cursor, sortBy));
      if (filter?.name) wheres.push(ilike(users.name, `%${escapeLike(filter.name)}%`));

      const members = await ctx.db
        .select(getColumns(users))
        .from(users)
        .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.userId, users.id))
        .where(and(...wheres))
        .orderBy(...parseSortByToSql(users, sortBy))
        .limit(limit + 1);
      return getCursorPaginationData(members, limit, sortBy);
    },
  ),
  readMembersByIds: getMemberProcedure(readMembersByIdsInputSchema, "roomId").query<User[]>(
    ({ ctx, input: { ids, roomId } }) =>
      ctx.db
        .select(getColumns(users))
        .from(users)
        .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.userId, users.id))
        .where(and(eq(usersToRoomsInMessage.roomId, roomId), inArray(users.id, ids))),
  ),
  readMembersCount: getMemberProcedure(roomIdSchema, "roomId").query<number>(
    async ({ ctx, input: { roomId } }) =>
      takeOne(
        await ctx.db
          .select({ count: count() })
          .from(usersToRoomsInMessage)
          .where(eq(usersToRoomsInMessage.roomId, roomId)),
      ).count,
  ),
  readMutualRooms: standardAuthedProcedure.input(userIdSchema).query<RoomInMessage[]>(({ ctx, input }) => {
    const usersToRoomsInMessage1 = alias(usersToRoomsInMessage, "usersToRoomsInMessage1");
    const usersToRoomsInMessage2 = alias(usersToRoomsInMessage, "usersToRoomsInMessage2");
    return ctx.db
      .select(getColumns(roomsInMessage))
      .from(roomsInMessage)
      .innerJoin(
        usersToRoomsInMessage1,
        and(
          eq(usersToRoomsInMessage1.roomId, roomsInMessage.id),
          eq(usersToRoomsInMessage1.userId, ctx.getSessionPayload.user.id),
        ),
      )
      .innerJoin(
        usersToRoomsInMessage2,
        and(eq(usersToRoomsInMessage2.roomId, roomsInMessage.id), eq(usersToRoomsInMessage2.userId, input.userId)),
      )
      .where(eq(roomsInMessage.type, RoomType.Room))
      .orderBy(desc(roomsInMessage.updatedAt))
      .limit(MAX_READ_LIMIT);
  }),
  readMyInvite: getMemberProcedure(roomIdSchema, "roomId")
    .use(assertIsRoomMiddleware)
    .query<InviteInMessage | null>(({ ctx, input: { roomId } }) =>
      readMyInvite(ctx.db, ctx.getSessionPayload.user.id, roomId),
    ),
  readRoom: standardAuthedProcedure.input(readRoomInputSchema).query<null | RoomInMessage>(async ({ ctx, input }) => {
    if (input) {
      const room = ctx.db.query.roomsInMessage.findFirst({
        where: {
          RAW: (roomTable, { and: andFilter, eq: eqFilter, exists }) => {
            const where = andFilter(
              eqFilter(roomTable.id, input),
              exists(
                ctx.db
                  .select({ _: sql`1` })
                  .from(usersToRoomsInMessage)
                  .where(
                    andFilter(
                      eqFilter(usersToRoomsInMessage.roomId, roomTable.id),
                      eqFilter(usersToRoomsInMessage.userId, ctx.getSessionPayload.user.id),
                    ),
                  ),
              ),
            );
            if (!where) throw new InvalidOperationError(Operation.Read, DatabaseEntityType.Room, input);
            return where;
          },
        },
      });
      return requireEntity(room, DatabaseEntityType.Room, input);
    }
    const latestRoom = (
      await ctx.db
        .select(getColumns(roomsInMessage))
        .from(roomsInMessage)
        .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
        .where(
          and(eq(usersToRoomsInMessage.userId, ctx.getSessionPayload.user.id), eq(roomsInMessage.type, RoomType.Room)),
        )
        .orderBy(desc(roomsInMessage.updatedAt))
        .limit(1)
    )[0];
    return latestRoom ?? null;
  }),
  readRoomInvites: getPermissionsProcedure(RoomPermission.ManageRoom, readRoomInvitesInputSchema, "roomId").query<
    CursorPaginationData<InviteInMessageWithCreator>
  >(async ({ ctx, input: { cursor, limit, roomId } }) => {
    const sortBy: SortItem<keyof InviteInMessage>[] = [CREATED_AT_DESCENDING_SORT_ITEM];
    const wheres: (SQL | undefined)[] = [eq(invitesInMessage.roomId, roomId)];
    if (cursor) wheres.push(getCursorWhere(invitesInMessage, cursor, sortBy));

    const invites = await ctx.db
      .select({ ...getColumns(invitesInMessage), user: getColumns(users) })
      .from(invitesInMessage)
      .innerJoin(users, eq(invitesInMessage.userId, users.id))
      .where(and(...wheres))
      .orderBy(...parseSortByToSql(invitesInMessage, sortBy))
      .limit(limit + 1);
    // Expiry and exhaustion are decided by `checkIsInviteUsable` rather than by a second copy of it in SQL, so
    // The page is cut over every row and only then filtered: a batch of lapsed links narrows what this page shows
    // Without ending the walk, and the cursor still names the oldest row read rather than the oldest usable one
    const { hasMore, items, nextCursor } = getCursorPaginationData(invites, limit, sortBy);
    return { hasMore, items: items.filter((invite) => checkIsInviteUsable(invite)), nextCursor };
  }),
  readRooms: getMemberProcedure(readRoomsInputSchema, "roomId").query<CursorPaginationData<RoomInMessage>>(
    async ({ ctx, input: { cursor, filter, limit, roomId, sortBy } }) => {
      const innerJoinCondition = and(
        eq(usersToRoomsInMessage.roomId, roomsInMessage.id),
        eq(usersToRoomsInMessage.userId, ctx.getSessionPayload.user.id),
      );
      let room: RoomInMessage | undefined;

      if (roomId) {
        const routeRoom = (
          await ctx.db
            .select(getColumns(roomsInMessage))
            .from(roomsInMessage)
            .innerJoin(usersToRoomsInMessage, innerJoinCondition)
            .where(eq(roomsInMessage.id, roomId))
        )[0];
        if (!routeRoom) throw getNotFoundError(DatabaseEntityType.Room, roomId);
        if (routeRoom.type === RoomType.Room) room = routeRoom;
      }

      const wheres: (SQL | undefined)[] = [eq(roomsInMessage.type, RoomType.Room)];
      if (cursor) wheres.push(getCursorWhere(roomsInMessage, cursor, sortBy));
      if (filter?.name) wheres.push(ilike(roomsInMessage.name, `%${escapeLike(filter.name)}%`));
      if (room) wheres.push(ne(roomsInMessage.id, room.id));

      const rooms = await ctx.db
        .select(getColumns(roomsInMessage))
        .from(roomsInMessage)
        .innerJoin(usersToRoomsInMessage, innerJoinCondition)
        .where(and(...wheres))
        .orderBy(...parseSortByToSql(roomsInMessage, sortBy))
        .limit(limit + 1);
      const cursorPaginationData = getCursorPaginationData(rooms, limit, sortBy);
      if (room) cursorPaginationData.items.push(room);
      return cursorPaginationData;
    },
  ),
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
  updateRoom: addProfanityFilterMiddleware(
    getPermissionsProcedure(RoomPermission.ManageRoom, updateRoomInputSchema, "id"),
    ["name"],
  ).mutation<RoomInMessage>(async ({ ctx, input: { id, ...rest } }) => {
    const { image } = rest;
    // Read before the update so the sweep below knows which version the room is dropping
    const previousImage =
      image === undefined
        ? ""
        : ((await ctx.db.query.roomsInMessage.findFirst({ columns: { image: true }, where: { id: { eq: id } } }))
            ?.image ?? "");
    const updatedRoom = requireMutation(
      (await ctx.db.update(roomsInMessage).set(rest).where(eq(roomsInMessage.id, id)).returning())[0],
      Operation.Update,
      DatabaseEntityType.Room,
      id,
    );
    roomEventEmitter.emit("updateRoom", updatedRoom);
    // The image was cleared or replaced: drop every prior upload the room no longer points at. An update that
    // Resubmits the url it loaded with replaced nothing, so it sweeps nothing — otherwise a settings save that
    // Only renamed the room would pay two blob listings on the request path to delete nothing. Best-effort: a
    // Dropped publish orphans a public blob, never the room update
    if (image !== undefined && image !== previousImage)
      await publishBlobDeletion(id, AzureContainer.PublicUserAssets, async () => {
        const containerClient = await useContainerClient(AzureContainer.PublicUserAssets);
        // The age filter decides the whole set, including the version this update drops. Nothing may bypass it:
        // A save carries the image url its form loaded with, which is a *stale* url whenever another admin
        // Uploaded in between — so the row value being replaced is exactly the value that can name the other
        // Admin's seconds-old avatar, and naming it explicitly would delete the live one with no later sweep able
        // To repair it. A version replaced within the window is therefore left for the next image change (or the
        // Room's deletion) to collect, which is the same deferral every other in-flight upload gets
        const blobNames = await listRoomProfileImageBlobNames(containerClient, id, {
          createdBefore: new Date(Date.now() - WRITE_SAS_DURATION_MS),
        });
        return blobNames.filter((blobName) => containerClient.getBlockBlobClient(blobName).url !== image);
      });

    return updatedRoom;
  }),
});

export const roomRouter = mergeRouters(
  baseRoomRouter,
  router({
    category: categoryRouter,
    directMessage: directMessageRouter,
    emoji: roomEmojiRouter,
    filter: filterRouter,
  }),
);
