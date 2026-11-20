import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { MemberRowInRoom } from "#shared/models/db/room/MemberRowInRoom";
import type { UserInRoom } from "#shared/models/db/room/UserInRoom";
import type { Page, RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { containsLike } from "#server/services/db/containsLike";
import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { createSystemRoomMessage } from "#server/services/message/createSystemRoomMessage";
import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { announceRoomMemberDeparture } from "#server/services/room/announceRoomMemberDeparture";
import { announceRoomMembersJoined } from "#server/services/room/announceRoomMembersJoined";
import { deleteRoom } from "#server/services/room/deleteRoom";
import { getDirectMessageDisplayNames } from "#server/services/room/getDirectMessageDisplayNames";
import { getLiveInviteWhere } from "#server/services/room/getLiveInviteWhere";
import { getNotLiveMembershipWhere } from "#server/services/room/getNotLiveMembershipWhere";
import { getReviveMembershipConflict } from "#server/services/room/getReviveMembershipConflict";
import { getRoomMemberJoinCondition } from "#server/services/room/getRoomMemberJoinCondition";
import { getRoomMembershipRemoval } from "#server/services/room/getRoomMembershipRemoval";
import { getRoomProfileImageBlobNameFromUrl } from "#server/services/room/getRoomProfileImageBlobNameFromUrl";
import { getRoomProfileImageBlobPrefix } from "#server/services/room/getRoomProfileImageBlobPrefix";
import { listRoomProfileImageBlobNames } from "#server/services/room/listRoomProfileImageBlobNames";
import { notifyOnlineRoomMembers } from "#server/services/room/notifyOnlineRoomMembers";
import { deleteOversizedUpload } from "#server/services/storage/deleteOversizedUpload";
import { getBucket } from "#server/services/storage/getBucket";
import { getPublicAssetUrl } from "#server/services/storage/getPublicAssetUrl";
import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { addProfanityFilterMiddleware } from "#server/trpc/middleware/addProfanityFilterMiddleware";
import { assertIsRoomMiddleware } from "#server/trpc/middleware/assertIsRoomMiddleware";
import { getProfanityFilterProcedure } from "#server/trpc/procedure/getProfanityFilterProcedure";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "#server/trpc/procedure/room/getPermissionsProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { categoryRouter } from "#server/trpc/routers/room/category";
import { directMessageRouter } from "#server/trpc/routers/room/directMessage";
import { emojiRouter } from "#server/trpc/routers/room/emoji";
import { filterRouter } from "#server/trpc/routers/room/filter";
import { createRoomInputSchema } from "#shared/models/db/room/CreateRoomInput";
import { deleteRoomInputSchema } from "#shared/models/db/room/DeleteRoomInput";
import { generateRoomProfileImageUploadUrlInputSchema } from "#shared/models/db/room/GenerateProfileImageUploadUrlInput";
import { joinRoomInputSchema } from "#shared/models/db/room/JoinRoomInput";
import { leaveRoomInputSchema } from "#shared/models/db/room/LeaveRoomInput";
import { readMembersInputSchema, readMembersPageSort } from "#shared/models/db/room/ReadMembersInput";
import { readRoomInputSchema } from "#shared/models/db/room/ReadRoomInput";
import { readRoomsInputSchema } from "#shared/models/db/room/ReadRoomsInput";
import { readUsersByIdsInputSchema } from "#shared/models/db/room/ReadUsersByIdsInput";
import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { IMAGE_UPLOAD_MIME_TYPES } from "#shared/services/file/constants";
import { createPageSort, createPresignedPutUrl, getPageOrderBy, getPageWhere, inJsonArray, toPage } from "@esposter/db";
import {
  DatabaseEntityType,
  DEFAULT_EVERYONE_PERMISSIONS,
  getDisplayNameExpression,
  getLiveRowWhere,
  getPublicUserColumns,
  invitesInMessage,
  MessageType,
  roomIdSchema,
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  RoomType,
  StorageBucket,
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

export const baseRoomRouter = router({
  createRoom: getProfanityFilterProcedure(createRoomInputSchema, ["name"]).mutation<RoomInMessage>(
    async ({ ctx, input }) => {
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
    },
  ),
  deleteRoom: standardAuthedProcedure
    .input(deleteRoomInputSchema)
    .use(assertIsRoomMiddleware)
    .mutation<UserToRoomInMessage>(({ ctx, input }) => deleteRoom(ctx, input)),
  generateProfileImageUploadUrl: getPermissionsProcedure(
    RoomPermission.ManageRoom,
    generateRoomProfileImageUploadUrlInputSchema,
    "roomId",
  )
    .meta({
      staticReason:
        "Answers a presigned upload url for a blob no reader shows until updateRoom saves it as the room's image",
    })
    .mutation<{ presignedUrl: string; publicUrl: string }>(async ({ input: { mimetype, roomId, size } }) => {
      // Refused before a write url is signed, as a call background's is: the signed type keeps the object an image, and
      // The size is the cap the client already checks before it asks
      if (size > MAX_FILE_REQUEST_SIZE || !IMAGE_UPLOAD_MIME_TYPES.includes(mimetype))
        throw getInvalidOperationError(Operation.Create, DatabaseEntityType.File, JSON.stringify({ mimetype, size }));

      // A unique segment per upload so a re-upload never lands on a prior blob name — that is what lets the cleanup
      // On image change (below) delete stale versions without a delayed delete ever removing a freshly uploaded one
      const blobName = `${getRoomProfileImageBlobPrefix(roomId)}/${v7()}`;
      const presignedUrl = await createPresignedPutUrl(
        getStorageCredentials(),
        StorageBucket.PublicUserAssets,
        blobName,
        mimetype,
      );
      return { presignedUrl, publicUrl: getPublicAssetUrl(StorageBucket.PublicUserAssets, blobName) };
    }),
  joinRoom: standardAuthedProcedure.input(joinRoomInputSchema).mutation<RoomInMessage>(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    // The room is read once, to name it in the errors and to pick the membership the batch writes. Every refusal of the link
    // Itself, an unknown, expired or used-up link, a paused room or a banned user, is decided by the batch below
    const invite = await ctx.db.query.invitesInMessage.findFirst({
      columns: { roomId: true },
      where: { id: { eq: input }, RAW: getLiveRowWhere },
    });
    if (!invite) throw getNotFoundError(DatabaseEntityType.Invite, input);

    const userToRoomContext = JSON.stringify({ roomId: invite.roomId, userId });
    // Two statements in one batch, in order. The first counts the link's use only while the link admits the caller and the
    // Caller holds no live membership there, so a second join at once finds the membership the first one wrote and counts
    // Nothing. The second writes the membership from the link, reviving a tombstone a removal left, and writes only when
    // Changes() reports that the first counted: changes() is the row count of the statement before it
    const [, joinedRows] = await ctx.db.batch([
      ctx.db
        .update(invitesInMessage)
        .set({ uses: sql`${invitesInMessage.uses} + 1` })
        .where(and(getLiveInviteWhere(ctx.db, input, userId), getNotLiveMembershipWhere(ctx.db, userId))),
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
            .where(and(eq(invitesInMessage.id, input), sql`changes() > 0`)),
        )
        .onConflictDoUpdate(getReviveMembershipConflict())
        .returning(),
    ]);
    // Nothing returned means the link refused the caller, or the caller already held the membership. A live membership is
    // The member's own answer, and anything else is the refusal an unknown link gives
    if (!joinedRows[0]) {
      const liveMembership = await ctx.db.query.usersToRoomsInMessage.findFirst({
        columns: { userId: true },
        where: { RAW: getLiveRowWhere, roomId: { eq: invite.roomId }, userId: { eq: userId } },
      });
      if (liveMembership)
        throw getInvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, userToRoomContext);
      throw getNotFoundError(DatabaseEntityType.Invite, input);
    }

    const { room, roomId, user } = await requireEntity(
      ctx.db.query.usersToRoomsInMessage.findFirst({
        where: { RAW: getLiveRowWhere, roomId: { eq: invite.roomId }, userId: { eq: userId } },
        with: UserToRoomInMessageRelations,
      }),
      DatabaseEntityType.UserToRoom,
      userToRoomContext,
    );

    await announceRoomMembersJoined(ctx.db, roomId, [user]);
    await createSystemRoomMessage(roomId, user.id, `${user.name} joined the room.`).match(noop, console.error);

    return room;
  }),
  leaveRoom: standardAuthedProcedure
    .input(leaveRoomInputSchema)
    .use(assertIsRoomMiddleware)
    .mutation<UserToRoomInMessage>(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const ownedRoom = await ctx.db.query.roomsInMessage.findFirst({
        columns: { id: true },
        where: { id: { eq: input }, userId: { eq: userId } },
      });

      if (ownedRoom) return deleteRoom(ctx, input);

      const [[removedMembership]] = await ctx.db.batch(getRoomMembershipRemoval(ctx.db, input, userId));
      const userToRoom = requireMutation(removedMembership, Operation.Delete, DatabaseEntityType.UserToRoom, input);

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

      return userToRoom;
    }),
  readMemberCountsByTopRole: getMemberProcedure(roomIdSchema, "roomId").query<MemberCountByTopRole[]>(
    ({ ctx, input: { roomId } }) => {
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
          and(
            eq(roomRolesInMessage.id, usersToRoomRolesInMessage.roleId),
            not(roomRolesInMessage.isEveryone),
            getLiveRowWhere(roomRolesInMessage),
          ),
        )
        .where(and(eq(usersToRoomRolesInMessage.roomId, roomId), getLiveRowWhere(usersToRoomRolesInMessage)))
        .as("rankedRoles");
      // Only role groups are returned — the roleless trailing group is derived client-side from the
      // Total member count, which the join and leave events keep current without a refetch
      return ctx.db
        .select({ count: count(), roleId: rankedRoles.roleId })
        .from(rankedRoles)
        .where(eq(rankedRoles.rank, 1))
        .groupBy(rankedRoles.roleId);
    },
  ),
  readMembers: getMemberProcedure(readMembersInputSchema, "roomId").query<Page<MemberRowInRoom>>(
    async ({ ctx, input: { cursor, filter, limit, roomId } }) => {
      // The display name is the sort, cursor and search key, so the order, the page boundary and the match all
      // Agree with the name the row renders
      const displayName = getDisplayNameExpression(usersToRoomsInMessage, usersInAuth);
      // Compared without regard to ASCII case, so a name sorts beside its lowercase spelling as a reader expects it to,
      // Which is the comparison the client sorts the loaded list by
      const boundSort = createPageSort(
        { displayName: sql<string>`${displayName} collate nocase`, id: usersInAuth.id },
        readMembersPageSort,
      );
      // A removed member is read as their tombstone, so a list holding the row drops it by its version, not by absence
      const wheres: (SQL | undefined)[] = [eq(usersToRoomsInMessage.roomId, roomId), getPageWhere(boundSort, cursor)];
      if (filter?.name)
        wheres.push(or(containsLike(displayName, filter.name), containsLike(usersInAuth.name, filter.name)));

      const members = await ctx.db
        .select({
          ...getPublicUserColumns(usersInAuth),
          deletedAt: usersToRoomsInMessage.deletedAt,
          displayName,
          roomId: usersToRoomsInMessage.roomId,
          userId: usersToRoomsInMessage.userId,
          version: usersToRoomsInMessage.version,
        })
        .from(usersInAuth)
        .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.userId, usersInAuth.id))
        .where(and(...wheres))
        .orderBy(...getPageOrderBy(boundSort, cursor))
        .limit(limit + 1);
      return toPage(members, readMembersPageSort, cursor, limit);
    },
  ),
  readMembersCount: getMemberProcedure(roomIdSchema, "roomId").query<number>(
    async ({ ctx, input: { roomId } }) =>
      takeOne(
        await ctx.db
          .select({ count: count() })
          .from(usersToRoomsInMessage)
          .where(and(eq(usersToRoomsInMessage.roomId, roomId), getLiveRowWhere(usersToRoomsInMessage))),
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
          eq(usersToRoomsInMessage1.userId, ctx.user.id),
          getLiveRowWhere(usersToRoomsInMessage1),
        ),
      )
      .innerJoin(
        usersToRoomsInMessage2,
        and(
          eq(usersToRoomsInMessage2.roomId, roomsInMessage.id),
          eq(usersToRoomsInMessage2.userId, input.userId),
          getLiveRowWhere(usersToRoomsInMessage2),
        ),
      )
      .where(eq(roomsInMessage.type, RoomType.Room))
      .orderBy(desc(roomsInMessage.lastMessageAt))
      .limit(MAX_READ_LIMIT);
  }),
  readRoom: standardAuthedProcedure
    .input(readRoomInputSchema)
    .query<RoomInMessage | undefined>(async ({ ctx, input }) => {
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
                        getLiveRowWhere(usersToRoomsInMessage),
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
            .where(
              and(
                eq(usersToRoomsInMessage.userId, ctx.user.id),
                eq(roomsInMessage.type, RoomType.Room),
                getLiveRowWhere(usersToRoomsInMessage),
              ),
            )
            .orderBy(desc(roomsInMessage.lastMessageAt))
            .limit(1)
        )[0];
    }),
  // The list reads the rooms table as a whole, so a rename or an image change of any room wakes it
  readRooms: getMemberProcedure(readRoomsInputSchema, "roomId").query<Page<RoomInMessage & { displayName: string }>>(
    async ({ ctx, input: { cursor, filter, includeDirectMessages, limit, roomId, sort } }) => {
      const innerJoinCondition = and(
        eq(usersToRoomsInMessage.roomId, roomsInMessage.id),
        eq(usersToRoomsInMessage.userId, ctx.user.id),
        getLiveRowWhere(usersToRoomsInMessage),
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
      // The route's room and the page are read from the same joins, so each read builds its own statement from this
      const selectRooms = () =>
        ctx.db
          .select({ ...roomColumns, displayName })
          .from(roomsInMessage)
          .innerJoin(usersToRoomsInMessage, innerJoinCondition)
          .leftJoin(directMessageDisplayNames, eq(directMessageDisplayNames.roomId, roomsInMessage.id));

      if (roomId) {
        const routeRoom = (await selectRooms().where(eq(roomsInMessage.id, roomId)))[0];
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

      const rooms = await selectRooms()
        .where(and(...wheres))
        .orderBy(...getPageOrderBy(boundSort, cursor))
        .limit(limit + 1);
      const page = toPage(rooms, sort, cursor, limit);
      return room ? { ...page, items: [...page.items, room] } : page;
    },
  ),
  // A row comes back for every id that has an account, a user who has left the room included, so a message whose author
  // Has left is still named. `isMember` tells the two apart, and a user with no membership is named by their account
  readUsersByIds: getMemberProcedure(readUsersByIdsInputSchema, "roomId").query<UserInRoom[]>(
    ({ ctx, input: { roomId, userIds } }) =>
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
  updateRoom: addProfanityFilterMiddleware(
    getPermissionsProcedure(RoomPermission.ManageRoom, updateRoomInputSchema, "id"),
    ["name"],
  ).mutation<RoomInMessage>(async ({ ctx, input: { id, ...rest } }) => {
    const { image } = rest;
    // A save naming one of this room's own uploads checks the bytes it holds, since the presigned PUT bounds none of them: an
    // Object over the cap is deleted and the save refused, ahead of the update, so the row never names an oversized image
    const uploadedImageBlobName = image === undefined ? undefined : getRoomProfileImageBlobNameFromUrl(id, image);
    if (
      uploadedImageBlobName !== undefined &&
      (await deleteOversizedUpload(StorageBucket.PublicUserAssets, uploadedImageBlobName, MAX_FILE_REQUEST_SIZE))
    )
      throw getInvalidOperationError(Operation.Update, DatabaseEntityType.Room, id);
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
    await notifyOnlineRoomMembers(id, { data: updatedRoom, type: "updateRoom" });
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
