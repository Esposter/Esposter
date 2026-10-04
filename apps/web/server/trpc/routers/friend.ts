import type { PublicUser } from "@esposter/db-schema";

import { escapeLike } from "#server/services/db/escapeLike";
import { on } from "#server/services/events/on";
import { friendEventEmitter } from "#server/services/friend/events/friendEventEmitter";
import { getFriendshipId } from "#server/services/friend/getFriendshipId";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import { searchUsersInputSchema } from "#shared/models/db/friend/SearchUsersInput";
import {
  blocksInSocial,
  DatabaseEntityType,
  friendsInSocial,
  getPublicUserColumns,
  usersInAuth,
} from "@esposter/db-schema";
import { MAX_READ_LIMIT, Operation } from "@esposter/shared";
import { and, eq, ilike, isNull, ne, or } from "drizzle-orm";

export const friendRouter = router({
  deleteFriend: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<void>(async ({ ctx, input: friendId }) => {
      const userId = ctx.getSessionPayload.user.id;
      if (userId === friendId) throw getInvalidOperationError(Operation.Delete, DatabaseEntityType.Friend, userId);

      const friendshipId = getFriendshipId(userId, friendId);
      requireMutation(
        (await ctx.db.delete(friendsInSocial).where(eq(friendsInSocial.id, friendshipId)).returning())[0],
        Operation.Delete,
        DatabaseEntityType.Friend,
        friendshipId,
        "NOT_FOUND",
      );
      friendEventEmitter.emit("deleteFriend", { receiverId: friendId, senderId: userId });
    }),
  onDeleteFriend: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [{ receiverId, senderId }] of on(friendEventEmitter, "deleteFriend", { signal }))
      if (receiverId === userId) yield senderId;
      else if (senderId === userId) yield receiverId;
  }),
  readFriends: standardAuthedProcedure.query<PublicUser[]>(({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    return ctx.db
      .select(getPublicUserColumns(usersInAuth))
      .from(friendsInSocial)
      .innerJoin(
        usersInAuth,
        or(
          and(eq(friendsInSocial.senderId, userId), eq(usersInAuth.id, friendsInSocial.receiverId)),
          and(eq(friendsInSocial.receiverId, userId), eq(usersInAuth.id, friendsInSocial.senderId)),
        ),
      );
  }),
  searchUsers: standardAuthedProcedure.input(searchUsersInputSchema).query<PublicUser[]>(({ ctx, input: name }) => {
    const userId = ctx.getSessionPayload.user.id;
    const blockedSubquery = ctx.db
      .select({ id: blocksInSocial.blockedId })
      .from(blocksInSocial)
      .where(eq(blocksInSocial.blockerId, userId))
      .union(
        ctx.db
          .select({ id: blocksInSocial.blockerId })
          .from(blocksInSocial)
          .where(eq(blocksInSocial.blockedId, userId)),
      )
      .as("blocked_users");
    return ctx.db
      .select(getPublicUserColumns(usersInAuth))
      .from(usersInAuth)
      .leftJoin(blockedSubquery, eq(blockedSubquery.id, usersInAuth.id))
      .where(
        and(ilike(usersInAuth.name, `%${escapeLike(name)}%`), ne(usersInAuth.id, userId), isNull(blockedSubquery.id)),
      )
      .limit(MAX_READ_LIMIT);
  }),
});
