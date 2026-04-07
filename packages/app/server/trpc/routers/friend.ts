import type { User } from "@esposter/db-schema";
import type { z } from "zod";

import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { escapeLike } from "@@/server/services/db/escapeLike";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, friends, FriendshipStatus, selectUserSchema, users } from "@esposter/db-schema";
import { ID_SEPARATOR, InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, or } from "drizzle-orm";

const friendUserIdInputSchema = selectUserSchema.shape.id;
export type FriendUserIdInput = z.infer<typeof friendUserIdInputSchema>;

const searchUsersInputSchema = selectUserSchema.shape.name;
export type SearchUsersInput = z.infer<typeof searchUsersInputSchema>;

const getFriendshipId = (userIdA: string, userIdB: string) => [userIdA, userIdB].toSorted().join(ID_SEPARATOR);

export const friendRouter = router({
  acceptFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      const id = getFriendshipId(senderId, userId);
      const [updatedFriend] = await ctx.db
        .update(friends)
        .set({ status: FriendshipStatus.Accepted })
        .where(and(eq(friends.id, id), eq(friends.receiverId, userId), eq(friends.status, FriendshipStatus.Pending)))
        .returning();
      if (!updatedFriend)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Friend, id).message,
        });
      return updatedFriend;
    }),
  declineFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      const id = getFriendshipId(senderId, userId);
      await ctx.db
        .delete(friends)
        .where(and(eq(friends.id, id), eq(friends.receiverId, userId), eq(friends.status, FriendshipStatus.Pending)));
    }),
  deleteFriend: standardAuthedProcedure.input(friendUserIdInputSchema).mutation(async ({ ctx, input: friendId }) => {
    const userId = ctx.getSessionPayload.user.id;
    const id = getFriendshipId(userId, friendId);
    await ctx.db.delete(friends).where(and(eq(friends.id, id), eq(friends.status, FriendshipStatus.Accepted)));
  }),
  readFriends: standardAuthedProcedure.query<User[]>(({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    return ctx.db
      .select(getTableColumns(users))
      .from(friends)
      .innerJoin(
        users,
        or(
          and(eq(friends.senderId, userId), eq(users.id, friends.receiverId)),
          and(eq(friends.receiverId, userId), eq(users.id, friends.senderId)),
        ),
      )
      .where(eq(friends.status, FriendshipStatus.Accepted));
  }),
  readPendingRequests: standardAuthedProcedure.query<User[]>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const pendingFriendships = await ctx.db.query.friends.findMany({
      where: { receiverId: { eq: userId }, status: { eq: FriendshipStatus.Pending } },
      with: { sender: true },
    });
    return pendingFriendships.map(({ sender }) => sender);
  }),
  readSentRequests: standardAuthedProcedure.query<User[]>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const sentFriendships = await ctx.db.query.friends.findMany({
      where: { senderId: { eq: userId }, status: { eq: FriendshipStatus.Pending } },
      with: { receiver: true },
    });
    return sentFriendships.map(({ receiver }) => receiver);
  }),
  searchUsers: standardAuthedProcedure.input(searchUsersInputSchema).query(({ ctx, input: name }) => {
    const userId = ctx.getSessionPayload.user.id;
    return ctx.db.query.users.findMany({
      limit: MAX_READ_LIMIT,
      where: { name: { ilike: `%${escapeLike(name)}%` }, id: { ne: userId } },
    });
  }),
  sendFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: receiverId }) => {
      const userId = ctx.getSessionPayload.user.id;
      if (userId === receiverId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, userId).message,
        });
      const id = getFriendshipId(userId, receiverId);
      const [newFriend] = await ctx.db
        .insert(friends)
        .values({ id, receiverId, senderId: userId })
        .onConflictDoNothing({ target: friends.id })
        .returning();
      if (newFriend) return newFriend;

      const existingFriend = await ctx.db.query.friends.findFirst({ where: { id: { eq: id } } });
      if (!existingFriend)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, id).message,
        });
      return existingFriend;
    }),
});
