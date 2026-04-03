import type { Room, User } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { createDirectMessageInputSchema } from "#shared/models/db/room/CreateDirectMessageInput";
import { hideDirectMessageInputSchema } from "#shared/models/db/room/HideDirectMessageInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { router } from "@@/server/trpc";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import {
  DatabaseEntityType,
  friends,
  FriendshipStatus,
  rooms,
  RoomType,
  selectRoomSchema,
  users,
  usersToRooms,
} from "@esposter/db-schema";
import { ID_SEPARATOR, InvalidOperationError, ItemMetadataPropertyNames, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, ne, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";

const readDirectMessagesInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(selectRoomSchema.keyof(), [
      { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
    ]).shape,
  })
  .prefault({});
export type ReadDirectMessagesInput = z.infer<typeof readDirectMessagesInputSchema>;

const readDirectMessageParticipantsInputSchema = selectRoomSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type ReadDirectMessageParticipantsInput = z.infer<typeof readDirectMessageParticipantsInputSchema>;

export const directMessageRouter = router({
  createDirectMessage: standardAuthedProcedure.input(createDirectMessageInputSchema).mutation<Room>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const userId = ctx.getSessionPayload.user.id;
      const allUserIds = [...new Set([userId, ...input])];
      const targetUserIds = allUserIds.filter((id) => id !== userId);
      if (targetUserIds.length === 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.DirectMessage, userId).message,
        });

      const acceptedFriendships = await tx
        .select()
        .from(friends)
        .where(
          and(
            eq(friends.status, FriendshipStatus.Accepted),
            or(
              and(eq(friends.senderId, userId), inArray(friends.receiverId, targetUserIds)),
              and(eq(friends.receiverId, userId), inArray(friends.senderId, targetUserIds)),
            ),
          ),
        );
      if (acceptedFriendships.length !== targetUserIds.length)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.DirectMessage, userId).message,
        });

      const participantKey = allUserIds.toSorted().join(ID_SEPARATOR);
      const [newRoom] = await tx
        .insert(rooms)
        .values({ name: "", participantKey, type: RoomType.DirectMessage, userId })
        .onConflictDoNothing({ target: rooms.participantKey })
        .returning();
      const room =
        newRoom ??
        (await tx.query.rooms.findFirst({ where: (rooms, { eq }) => eq(rooms.participantKey, participantKey) }));
      if (!room)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.DirectMessage, participantKey)
            .message,
        });

      await tx
        .insert(usersToRooms)
        .values(allUserIds.map((userId) => ({ roomId: room.id, userId })))
        .onConflictDoNothing();
      await tx
        .update(usersToRooms)
        .set({ isHidden: false })
        .where(and(eq(usersToRooms.roomId, room.id), eq(usersToRooms.userId, userId)));
      return room;
    }),
  ),
  hideDirectMessage: standardAuthedProcedure.input(hideDirectMessageInputSchema).mutation(async ({ ctx, input }) => {
    await isMember(ctx.db, ctx.getSessionPayload, input);
    await ctx.db
      .update(usersToRooms)
      .set({ isHidden: true })
      .where(and(eq(usersToRooms.roomId, input), eq(usersToRooms.userId, ctx.getSessionPayload.user.id)));
  }),
  readDirectMessageParticipants: standardAuthedProcedure
    .input(readDirectMessageParticipantsInputSchema)
    .query(async ({ ctx, input: roomIds }) => {
      const utr1 = alias(usersToRooms, "utr1");
      const utr2 = alias(usersToRooms, "utr2");
      const rows = await ctx.db
        .select({ roomId: utr2.roomId, user: users })
        .from(utr1)
        .innerJoin(utr2, and(eq(utr2.roomId, utr1.roomId), ne(utr2.userId, ctx.getSessionPayload.user.id)))
        .innerJoin(users, eq(users.id, utr2.userId))
        .where(and(eq(utr1.userId, ctx.getSessionPayload.user.id), inArray(utr1.roomId, roomIds)));
      const participantsMap = new Map<string, User[]>();
      for (const { roomId, user } of rows) {
        const existingParticipants = participantsMap.get(roomId) ?? [];
        existingParticipants.push(user);
        participantsMap.set(roomId, existingParticipants);
      }
      return [...participantsMap.entries()].map(([roomId, participants]) => ({ participants, roomId }));
    }),
  readDirectMessages: standardAuthedProcedure
    .input(readDirectMessagesInputSchema)
    .query(async ({ ctx, input: { cursor, limit, sortBy } }) => {
      const innerJoinCondition = and(
        eq(usersToRooms.roomId, rooms.id),
        eq(usersToRooms.userId, ctx.getSessionPayload.user.id),
        eq(usersToRooms.isHidden, false),
      );
      const wheres: (SQL | undefined)[] = [eq(rooms.type, RoomType.DirectMessage)];
      if (cursor) wheres.push(getCursorWhere(rooms, cursor, sortBy));

      const readRooms = await ctx.db
        .select({ rooms })
        .from(rooms)
        .innerJoin(usersToRooms, innerJoinCondition)
        .where(and(...wheres))
        .orderBy(...parseSortByToSql(rooms, sortBy))
        .limit(limit + 1);
      return getCursorPaginationData(
        readRooms.map(({ rooms }) => rooms),
        limit,
        sortBy,
      );
    }),
});
