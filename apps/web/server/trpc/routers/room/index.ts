import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { UserInRoom } from "#shared/models/db/room/UserInRoom";
import type { Page, RoomInMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { checkIsUniqueViolation } from "#server/services/db/checkIsUniqueViolation";
import { containsLike } from "#server/services/db/containsLike";
import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { createSystemRoomMessage } from "#server/services/message/createSystemRoomMessage";
import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { announceRoomMemberDeparture } from "#server/services/room/announceRoomMemberDeparture";
import { announceRoomMembersJoined } from "#server/services/room/announceRoomMembersJoined";
import { deleteRoom } from "#server/services/room/deleteRoom";
import { getDirectMessageDisplayNames } from "#server/services/room/getDirectMessageDisplayNames";
import { getLiveInviteWhere } from "#server/services/room/getLiveInviteWhere";
import { getRoomListTopics } from "#server/services/room/getRoomListTopics";
import { getRoomMemberJoinCondition } from "#server/services/room/getRoomMemberJoinCondition";
import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { getRoomProfileImageBlobPrefix } from "#server/services/room/getRoomProfileImageBlobPrefix";
import { listRoomProfileImageBlobNames } from "#server/services/room/listRoomProfileImageBlobNames";
import { notifyOnlineRoomMembers } from "#server/services/room/notifyOnlineRoomMembers";
import { getBucket } from "#server/services/storage/getBucket";
import { getPublicAssetUrl } from "#server/services/storage/getPublicAssetUrl";
import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { addProfanityFilterMiddleware } from "#server/trpc/middleware/addProfanityFilterMiddleware";
import { assertIsRoomMiddleware } from "#server/trpc/middleware/assertIsRoomMiddleware";
import { getProfanityFilterProcedure } from "#server/trpc/procedure/getProfanityFilterProcedure";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "#server/trpc/procedure/room/getPermissionsProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { categoryRouter } from "#server/trpc/routers/room/category";
import { directMessageRouter } from "#server/trpc/routers/room/directMessage";
import { emojiRouter } from "#server/trpc/routers/room/emoji";
import { filterRouter } from "#server/trpc/routers/room/filter";
import { createRoomInputSchema } from "#shared/models/db/room/CreateRoomInput";
import { deleteRoomInputSchema } from "#shared/models/db/room/DeleteRoomInput";
import { joinRoomInputSchema } from "#shared/models/db/room/JoinRoomInput";
import { leaveRoomInputSchema } from "#shared/models/db/room/LeaveRoomInput";
import { readMembersInputSchema, readMembersPageSort } from "#shared/models/db/room/ReadMembersInput";
import { readRoomInputSchema } from "#shared/models/db/room/ReadRoomInput";
import { readRoomsInputSchema } from "#shared/models/db/room/ReadRoomsInput";
import { readUsersByIdsInputSchema } from "#shared/models/db/room/ReadUsersByIdsInput";
import { createPageSort, createPresignedPutUrl, getPageOrderBy, getPageWhere, inJsonArray, toPage } from "@esposter/db";
import {
  DatabaseEntityType,
  DEFAULT_EVERYONE_PERMISSIONS,
  getDisplayNameExpression,
  getPublicUserColumns,
  getTopic,
  invitesInMessage,
  MessageType,
  roomIdSchema,
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  RoomType,
  selectRoomInMessageSchema,
  StorageBucket,
  TopicKind,
  updateRoomInputSchema,
  userIdSchema,
  usersInAuth,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
  UserToRoomInMessageRelations,
  WRITE_PRESIGNED_URL_DURATION_MS,
} from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, MAX_READ_LIMIT, noop, Operation, takeOne } from "@esposter/shared";
import { mergeRouters } from "@trpc/server/unstable-core-do-not-import";
import { and, count, desc, eq, getColumns, inArray, ne, not, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { v7 } from "uuid";
import { z } from "zod";

export const baseRoomRouter = router({
  createRoom: getTopicsProcedure(getProfanityFilterProcedure(createRoomInputSchema, ["name"]), ({ ctx }) =>
    getRoomListTopics(ctx.user.id),
  ).mutation<RoomInMessage>(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    // The id is named up front, since the membership and the @everyone role both belong to the room being created
    const roomId = v7();
    const [newRoomRows] = await ctx.db.batch([
      ctx.db
        .insert(roomsInMessage)
        .values({ ...input, id: roomId, userId })
        .returning(),
      ctx.db.insert(usersToRoomsInMessage).values({ roomId, userId }),
      ctx.db
        .insert(roomRolesInMessage)
        .values({
          isEveryone: true,
          name: "@everyone",
          permissions: DEFAULT_EVERYONE_PERMISSIONS,
          position: 0,
          roomId,
        }),
    ]);
    return requireMutation(newRoomRows[0], Operation.Create, DatabaseEntityType.Room, JSON.stringify(input));
  }),
  deleteRoom: getTopicsProcedure(
    standardAuthedProcedure.input(deleteRoomInputSchema).use(assertIsRoomMiddleware),
    ({ ctx, input }) => [getTopic(TopicKind.Room, input), ...getRoomListTopics(ctx.user.id)],
  ).mutation<RoomInMessage>(({ ctx, input }) => deleteRoom(ctx, input)),
  generateProfileImageUploadUrl: getPermissionsProcedure(RoomPermission.ManageRoom, roomIdSchema, "roomId")
    .meta({
      staticReason:
        "Answers a presigned upload url for a blob no reader shows until updateRoom saves it as the room's image",
    })
    .mutation<{ presignedUrl: string; publicUrl: string }>(async ({ input: { roomId } }) => {
      // A unique segment per upload so a re-upload never lands on a prior blob name — that is what lets the cleanup
      // On image change (below) delete stale versions without a delayed delete ever removing a freshly uploaded one
      const blobName = `${getRoomProfileImageBlobPrefix(roomId)}/${v7()}`;
      const presignedUrl = await createPresignedPutUrl(
        getStorageCredentials(),
        StorageBucket.PublicUserAssets,
        blobName,
      );
      return { presignedUrl, publicUrl: getPublicAssetUrl(StorageBucket.PublicUserAssets, blobName) };
    }),
  joinRoom: getTopicsProcedure(standardAuthedProcedure.input(joinRoomInputSchema), ({ ctx, output }) => {
    const roomId = selectRoomInMessageSchema.pick({ id: true }).parse(output).id;
    return [getTopic(TopicKind.Room, roomId), ...getRoomListTopics(ctx.user.id)];
  }).mutation<RoomInMessage>(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    // The room is read once, to name it in the duplicate-join error. Every refusal of the link itself, an unknown,
    // Expired or used-up link, a paused room or a banned user, is decided by the batch below, so no read repeats its rules
    const invite = await ctx.db.query.invitesInMessage.findFirst({
      columns: { roomId: true },
      where: { id: { eq: input } },
    });
    if (!invite) throw getNotFoundError(DatabaseEntityType.Invite, input);

    const userToRoomContext = JSON.stringify({ roomId: invite.roomId, userId });
    // The membership and the use it consumes are one batch, and each is selected only while the link still admits the
    // Caller. A second join of the same user collides on the membership's key and refuses the batch the same way
    const liveInviteWhere = getLiveInviteWhere(ctx.db, input, userId);
    const [joinedRows] = await getResultAsync(() =>
      ctx.db.batch([
        ctx.db
          .insert(usersToRoomsInMessage)
          .select(
            ctx.db
              .select({
                ...getInsertSelectMetadata(usersToRoomsInMessage),
                roomId: invitesInMessage.roomId,
                userId: sql`${userId}`.as("userId"),
              })
              .from(invitesInMessage)
              .where(liveInviteWhere),
          )
          .returning(),
        ctx.db
          .update(invitesInMessage)
          .set({ uses: sql`${invitesInMessage.uses} + 1` })
          .where(liveInviteWhere),
      ]),
    ).match(
      (results) => results,
      (error) => {
        if (checkIsUniqueViolation(error))
          throw getInvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, userToRoomContext);
        throw error;
      },
    );
    if (!joinedRows[0]) throw getNotFoundError(DatabaseEntityType.Invite, input);

    const { room, roomId, user } = await requireEntity(
      ctx.db.query.usersToRoomsInMessage.findFirst({
        where: { roomId: { eq: invite.roomId }, userId: { eq: userId } },
        with: UserToRoomInMessageRelations,
      }),
      DatabaseEntityType.UserToRoom,
      userToRoomContext,
    );

    await announceRoomMembersJoined(ctx.db, roomId, [user]);
    await createSystemRoomMessage(roomId, user.id, `${user.name} joined the room.`).match(noop, console.error);

    return room;
  }),
  leaveRoom: getTopicsProcedure(
    standardAuthedProcedure.input(leaveRoomInputSchema).use(assertIsRoomMiddleware),
    ({ ctx, input }) => [getTopic(TopicKind.Room, input), ...getRoomListTopics(ctx.user.id)],
  ).mutation<RoomInMessage["id"]>(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const ownedRoom = await ctx.db.query.roomsInMessage.findFirst({
      columns: { id: true },
      where: { id: { eq: input }, userId: { eq: userId } },
    });

    if (ownedRoom) return (await deleteRoom(ctx, input)).id;

    const userToRoom = requireMutation(
      (await ctx.db.delete(usersToRoomsInMessage).where(getRoomMembershipWhere(input, userId)).returning())[0],
      Operation.Delete,
      DatabaseEntityType.UserToRoom,
      input,
    );

    await announceRoomMemberDeparture(userToRoom);
    // Best-effort after the membership delete — the name lookup only exists to word the system message, so
    // A failure costs the room one "X left" line, never the leave that already landed.
    await getResultAsync(async () => {
      const leavingMember = await ctx.db.query.usersInAuth.findFirst({
        columns: { name: true },
        where: { id: { eq: userId } },
      });
      if (leavingMember)
        await createSystemRoomMessage(userToRoom.roomId, userId, `${leavingMember.name} left the room.`).match(
          noop,
          console.error,
        );
    }).match(noop, console.error);

    return userToRoom.roomId;
  }),
  readMemberCountsByTopRole: getTopicsProcedure(getMemberProcedure(roomIdSchema, "roomId"), ({ input: { roomId } }) => [
    getTopic(TopicKind.Room, roomId),
  ]).query<MemberCountByTopRole[]>(({ ctx, input: { roomId } }) => {
    // A member's top role is their highest-positioned assigned role; @everyone is implicit and never groups. Each
    // Member's assigned roles are ranked from the highest, and only the first of each member's is kept
    const rankedRoles = ctx.db
      .select({
        rank: sql<number>`row_number() over (partition by ${usersToRoomRolesInMessage.userId} order by ${roomRolesInMessage.position} desc)`.as(
          "rank",
        ),
        roleId: usersToRoomRolesInMessage.roleId,
      })
      .from(usersToRoomRolesInMessage)
      .innerJoin(
        roomRolesInMessage,
        and(eq(roomRolesInMessage.id, usersToRoomRolesInMessage.roleId), not(roomRolesInMessage.isEveryone)),
      )
      .where(eq(usersToRoomRolesInMessage.roomId, roomId))
      .as("rankedRoles");
    // Only role groups are returned — the roleless trailing group is derived client-side from the
    // Total member count, which the join and leave events keep current without a refetch
    return ctx.db
      .select({ count: count(), roleId: rankedRoles.roleId })
      .from(rankedRoles)
      .where(eq(rankedRoles.rank, 1))
      .groupBy(rankedRoles.roleId);
  }),
  readMembers: getTopicsProcedure(getMemberProcedure(readMembersInputSchema, "roomId"), ({ input: { roomId } }) => [
    getTopic(TopicKind.Room, roomId),
  ]).query<Page<MemberInRoom>>(async ({ ctx, input: { cursor, filter, limit, roomId } }) => {
    // The display name is the sort, cursor and search key, so the order, the page boundary and the match all
    // Agree with the name the row renders
    const displayName = getDisplayNameExpression(usersToRoomsInMessage, usersInAuth);
    // Compared without regard to ASCII case, so a name sorts beside its lowercase spelling as a reader expects it to,
    // Which is the comparison the client sorts the loaded list by
    const boundSort = createPageSort(
      { displayName: sql<string>`${displayName} collate nocase`, id: usersInAuth.id },
      readMembersPageSort,
    );
    const wheres: (SQL | undefined)[] = [eq(usersToRoomsInMessage.roomId, roomId), getPageWhere(boundSort, cursor)];
    if (filter?.name)
      wheres.push(or(containsLike(displayName, filter.name), containsLike(usersInAuth.name, filter.name)));

    const members = await ctx.db
      .select({ ...getPublicUserColumns(usersInAuth), displayName })
      .from(usersInAuth)
      .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.userId, usersInAuth.id))
      .where(and(...wheres))
      .orderBy(...getPageOrderBy(boundSort, cursor))
      .limit(limit + 1);
    return toPage(members, readMembersPageSort, cursor, limit);
  }),
  readMembersCount: getTopicsProcedure(getMemberProcedure(roomIdSchema, "roomId"), ({ input: { roomId } }) => [
    getTopic(TopicKind.Room, roomId),
  ]).query<number>(
    async ({ ctx, input: { roomId } }) =>
      takeOne(
        await ctx.db
          .select({ count: count() })
          .from(usersToRoomsInMessage)
          .where(eq(usersToRoomsInMessage.roomId, roomId)),
      ).count,
  ),
  readMutualRooms: getTopicsProcedure(standardAuthedProcedure.input(userIdSchema), ({ ctx, input }) => [
    ...getRoomListTopics(input.userId),
    ...getRoomListTopics(ctx.user.id),
  ]).query<RoomInMessage[]>(({ ctx, input }) => {
    const usersToRoomsInMessage1 = alias(usersToRoomsInMessage, "usersToRoomsInMessage1");
    const usersToRoomsInMessage2 = alias(usersToRoomsInMessage, "usersToRoomsInMessage2");
    return ctx.db
      .select(getColumns(roomsInMessage))
      .from(roomsInMessage)
      .innerJoin(
        usersToRoomsInMessage1,
        and(eq(usersToRoomsInMessage1.roomId, roomsInMessage.id), eq(usersToRoomsInMessage1.userId, ctx.user.id)),
      )
      .innerJoin(
        usersToRoomsInMessage2,
        and(eq(usersToRoomsInMessage2.roomId, roomsInMessage.id), eq(usersToRoomsInMessage2.userId, input.userId)),
      )
      .where(eq(roomsInMessage.type, RoomType.Room))
      .orderBy(desc(roomsInMessage.lastMessageAt))
      .limit(MAX_READ_LIMIT);
  }),
  readRoom: getTopicsProcedure(standardAuthedProcedure.input(readRoomInputSchema), ({ ctx, input }) =>
    input === undefined ? getRoomListTopics(ctx.user.id) : [getTopic(TopicKind.Room, input)],
  ).query<RoomInMessage | undefined>(async ({ ctx, input }) => {
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
                      eqFilter(usersToRoomsInMessage.userId, ctx.user.id),
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
    } else
      return (
        await ctx.db
          .select(getColumns(roomsInMessage))
          .from(roomsInMessage)
          .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
          .where(and(eq(usersToRoomsInMessage.userId, ctx.user.id), eq(roomsInMessage.type, RoomType.Room)))
          .orderBy(desc(roomsInMessage.lastMessageAt))
          .limit(1)
      )[0];
  }),
  // Each listed room's own topic too, since the sidebar shows its name and image, which change without the list doing so
  readRooms: getTopicsProcedure(
    getMemberProcedure(readRoomsInputSchema, "roomId"),
    ({ ctx, input: { roomId }, output }) => [
      ...(roomId === undefined ? [] : [getTopic(TopicKind.Room, roomId)]),
      ...getRoomListTopics(ctx.user.id),
      ...z
        .object({ items: z.array(selectRoomInMessageSchema.pick({ id: true })) })
        .parse(output)
        .items.map(({ id }) => getTopic(TopicKind.Room, id)),
    ],
  ).query<Page<RoomInMessage & { displayName: string }>>(
    async ({ ctx, input: { cursor, filter, includeDirectMessages, limit, roomId, sort } }) => {
      const innerJoinCondition = and(
        eq(usersToRoomsInMessage.roomId, roomsInMessage.id),
        eq(usersToRoomsInMessage.userId, ctx.user.id),
      );
      const directMessageDisplayNames = getDirectMessageDisplayNames(ctx.db, ctx.user.id);
      const displayName = sql<string>`coalesce(nullif(${roomsInMessage.name}, ''), ${directMessageDisplayNames.displayName}, '')`;
      const roomColumns = getColumns(roomsInMessage);
      const boundSort = createPageSort(
        {
          displayName: sql<string>`${displayName} collate nocase`,
          id: roomsInMessage.id,
          lastMessageAt: roomsInMessage.lastMessageAt,
        },
        sort,
      );
      let room: (RoomInMessage & { displayName: string }) | undefined;

      if (roomId) {
        const routeRoom = (
          await ctx.db
            .select({ ...roomColumns, displayName })
            .from(roomsInMessage)
            .innerJoin(usersToRoomsInMessage, innerJoinCondition)
            .leftJoin(directMessageDisplayNames, eq(directMessageDisplayNames.roomId, roomsInMessage.id))
            .where(eq(roomsInMessage.id, roomId))
        )[0];
        if (!routeRoom) throw getNotFoundError(DatabaseEntityType.Room, roomId);
        if (routeRoom.type === RoomType.Room || (includeDirectMessages && routeRoom.type === RoomType.DirectMessage))
          room = routeRoom;
      }

      const wheres: (SQL | undefined)[] = [
        inArray(roomsInMessage.type, includeDirectMessages ? [RoomType.Room, RoomType.DirectMessage] : [RoomType.Room]),
      ];
      if (includeDirectMessages)
        wheres.push(or(ne(roomsInMessage.type, RoomType.DirectMessage), eq(usersToRoomsInMessage.isHidden, false)));
      wheres.push(getPageWhere(boundSort, cursor));
      if (filter?.name) wheres.push(containsLike(displayName, filter.name));
      if (room) wheres.push(ne(roomsInMessage.id, room.id));

      const rooms = await ctx.db
        .select({ ...roomColumns, displayName })
        .from(roomsInMessage)
        .innerJoin(usersToRoomsInMessage, innerJoinCondition)
        .leftJoin(directMessageDisplayNames, eq(directMessageDisplayNames.roomId, roomsInMessage.id))
        .where(and(...wheres))
        .orderBy(...getPageOrderBy(boundSort, cursor))
        .limit(limit + 1);
      const page = toPage(rooms, sort, cursor, limit);
      return room ? { ...page, items: [...page.items, room] } : page;
    },
  ),
  // A row comes back for every id that has an account, a user who has left the room included, so a message whose author
  // Has left is still named. `isMember` tells the two apart, and a user with no membership is named by their account
  readUsersByIds: getTopicsProcedure(
    getMemberProcedure(readUsersByIdsInputSchema, "roomId"),
    ({ input: { roomId } }) => [getTopic(TopicKind.Room, roomId)],
  ).query<UserInRoom[]>(({ ctx, input: { roomId, userIds } }) =>
    ctx.db
      .select({
        ...getPublicUserColumns(usersInAuth),
        displayName: getDisplayNameExpression(usersToRoomsInMessage, usersInAuth),
        isMember: sql<boolean>`${usersToRoomsInMessage.userId} is not null`.mapWith(Boolean),
      })
      .from(usersInAuth)
      .leftJoin(usersToRoomsInMessage, getRoomMemberJoinCondition(roomId))
      .where(inJsonArray(usersInAuth.id, userIds)),
  ),
  updateRoom: getTopicsProcedure(
    addProfanityFilterMiddleware(getPermissionsProcedure(RoomPermission.ManageRoom, updateRoomInputSchema, "id"), [
      "name",
    ]),
    ({ input: { id } }) => [getTopic(TopicKind.Room, id)],
  ).mutation<RoomInMessage>(async ({ ctx, input: { id, ...rest } }) => {
    const { image } = rest;
    // The previous row is read in the batch ahead of the update, so the sweep below knows which version the room is
    // Dropping and the rename line knows whether the name moved. Both statements are one batch, so two admins renaming
    // It at once cannot both read the old name: the second one's read lands after the first one's write
    const [previousRoomRows, updatedRoomRows] = await ctx.db.batch([
      ctx.db
        .select({ image: roomsInMessage.image, name: roomsInMessage.name })
        .from(roomsInMessage)
        .where(eq(roomsInMessage.id, id)),
      ctx.db.update(roomsInMessage).set(rest).where(eq(roomsInMessage.id, id)).returning(),
    ]);
    const previousRoom = previousRoomRows[0];
    const updatedRoom = requireMutation(updatedRoomRows[0], Operation.Update, DatabaseEntityType.Room, id);
    const previousImage = image === undefined ? "" : (previousRoom?.image ?? "");
    await notifyOnlineRoomMembers(id, { data: { id, ...rest }, type: "updateRoom" });
    // The rename line is the server's to write, like every other line in the room's voice, so no member can post
    // One for a rename that never happened. Compared against the stored name, so a trailing space alone is not a
    // Rename. Best-effort behind the update, which has already landed
    if (updatedRoom.name !== previousRoom?.name)
      await createSystemRoomMessage(id, ctx.user.id, updatedRoom.name, { type: MessageType.EditRoom }).match(
        noop,
        console.error,
      );
    // The image was cleared or replaced: drop every prior upload the room no longer points at. An update that
    // Resubmits the url it loaded with replaced nothing, so it sweeps nothing — otherwise a settings save that
    // Only renamed the room would pay two blob listings on the request path to delete nothing. Best-effort: a
    // Dropped publish orphans a public blob, never the room update
    if (image !== undefined && image !== previousImage)
      await publishBlobDeletion(StorageBucket.PublicUserAssets, async () => {
        const bucket = getBucket(StorageBucket.PublicUserAssets);
        // The age filter decides the whole set, including the version this update drops. Nothing may bypass it:
        // A save carries the image url its form loaded with, which is a *stale* url whenever another admin
        // Uploaded in between — so the row value being replaced is exactly the value that can name the other
        // Admin's seconds-old avatar, and naming it explicitly would delete the live one with no later sweep able
        // To repair it. A version replaced within the window is therefore left for the next image change (or the
        // Room's deletion) to collect, which is the same deferral every other in-flight upload gets
        const blobNames = await listRoomProfileImageBlobNames(bucket, id, {
          createdBefore: new Date(Date.now() - WRITE_PRESIGNED_URL_DURATION_MS),
        });
        return blobNames.filter((blobName) => getPublicAssetUrl(StorageBucket.PublicUserAssets, blobName) !== image);
      }).match(noop, console.error);

    return updatedRoom;
  }),
});

export const roomRouter = mergeRouters(
  baseRoomRouter,
  router({ category: categoryRouter, directMessage: directMessageRouter, emoji: emojiRouter, filter: filterRouter }),
);
