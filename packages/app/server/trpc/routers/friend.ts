import type { User } from "@esposter/db-schema";
import type { z } from "zod";

import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, FriendshipStatus, friends, selectUserSchema, users } from "@esposter/db-schema";
import { ID_SEPARATOR, InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, ne } from "drizzle-orm";

const friendUserIdInputSchema = selectUserSchema.shape.id;
export type FriendUserIdInput = z.infer<typeof friendUserIdInputSchema>;

const searchUsersInputSchema = selectUserSchema.shape.name;
export type SearchUsersInput = z.infer<typeof searchUsersInputSchema>;

const getFriendshipId = (userIdA: string, userIdB: string) => [userIdA, userIdB].toSorted().join(ID_SEPARATOR);

export const friendRouter = router({
  acceptFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: senderId }) => {
      const me = ctx.getSessionPayload.user.id;
      const id = getFriendshipId(senderId, me);
      const [updated] = await ctx.db
        .update(friends)
        .set({ status: FriendshipStatus.Accepted })
        .where(and(eq(friends.id, id), eq(friends.receiverId, me), eq(friends.status, FriendshipStatus.Pending)))
        .returning();
      if (!updated)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Friend, id).message,
        });
      return updated;
    }),
  declineFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: senderId }) => {
      const me = ctx.getSessionPayload.user.id;
      const id = getFriendshipId(senderId, me);
      await ctx.db
        .delete(friends)
        .where(and(eq(friends.id, id), eq(friends.receiverId, me), eq(friends.status, FriendshipStatus.Pending)));
    }),
  deleteFriend: standardAuthedProcedure.input(friendUserIdInputSchema).mutation(async ({ ctx, input: friendId }) => {
    const me = ctx.getSessionPayload.user.id;
    const id = getFriendshipId(me, friendId);
    await ctx.db.delete(friends).where(and(eq(friends.id, id), eq(friends.status, FriendshipStatus.Accepted)));
  }),
  readFriends: standardAuthedProcedure.query(async ({ ctx }): Promise<User[]> => {
    const me = ctx.getSessionPayload.user.id;
    const asSender = await ctx.db
      .select({ ...users })
      .from(friends)
      .innerJoin(users, eq(users.id, friends.receiverId))
      .where(and(eq(friends.senderId, me), eq(friends.status, FriendshipStatus.Accepted)));
    const asReceiver = await ctx.db
      .select({ ...users })
      .from(friends)
      .innerJoin(users, eq(users.id, friends.senderId))
      .where(and(eq(friends.receiverId, me), eq(friends.status, FriendshipStatus.Accepted)));
    return [...asSender, ...asReceiver];
  }),
  readPendingRequests: standardAuthedProcedure.query(async ({ ctx }): Promise<User[]> => {
    const me = ctx.getSessionPayload.user.id;
    return ctx.db
      .select({ ...users })
      .from(friends)
      .innerJoin(users, eq(users.id, friends.senderId))
      .where(and(eq(friends.receiverId, me), eq(friends.status, FriendshipStatus.Pending)));
  }),
  readSentRequests: standardAuthedProcedure.query(async ({ ctx }): Promise<User[]> => {
    const me = ctx.getSessionPayload.user.id;
    return ctx.db
      .select({ ...users })
      .from(friends)
      .innerJoin(users, eq(users.id, friends.receiverId))
      .where(and(eq(friends.senderId, me), eq(friends.status, FriendshipStatus.Pending)));
  }),
  searchUsers: standardAuthedProcedure.input(searchUsersInputSchema).query(async ({ ctx, input: name }) => {
    const me = ctx.getSessionPayload.user.id;
    return ctx.db
      .select()
      .from(users)
      .where(and(ilike(users.name, `%${name}%`), ne(users.id, me)))
      .limit(20);
  }),
  sendFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: receiverId }) => {
      const me = ctx.getSessionPayload.user.id;
      if (me === receiverId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, me).message,
        });
      const id = getFriendshipId(me, receiverId);
      const existing = await ctx.db.query.friends.findFirst({ where: (f, { eq }) => eq(f.id, id) });
      if (existing) return existing;
      const [created] = await ctx.db.insert(friends).values({ id, receiverId, senderId: me }).returning();
      if (!created)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, id).message,
        });
      return created;
    }),
});
