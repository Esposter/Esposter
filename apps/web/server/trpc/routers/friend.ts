import type { PublicUser } from "@esposter/db-schema";

import { containsLike } from "#server/services/db/containsLike";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import { searchUsersInputSchema } from "#shared/models/db/friend/SearchUsersInput";
import {
  blocksInSocial,
  DatabaseEntityType,
  friendsInSocial,
  getPublicUserColumns,
  getTopic,
  publicUserSchema,
  TopicKind,
  usersInAuth,
} from "@esposter/db-schema";
import { getFriendshipId, MAX_READ_LIMIT, Operation } from "@esposter/shared";
import { and, eq, isNull, ne, or } from "drizzle-orm";
import { z } from "zod";

export const friendRouter = router({
  deleteFriend: getTopicsProcedure(
    standardAuthedProcedure.input(friendUserIdInputSchema),
    ({ ctx, input: friendId }) => [getTopic(TopicKind.Friend, ctx.user.id), getTopic(TopicKind.Friend, friendId)],
  ).mutation<void>(async ({ ctx, input: friendId }) => {
    const userId = ctx.user.id;
    if (userId === friendId) throw getInvalidOperationError(Operation.Delete, DatabaseEntityType.Friend, userId);

    const friendshipId = getFriendshipId(userId, friendId);
    requireMutation(
      (await ctx.db.delete(friendsInSocial).where(eq(friendsInSocial.id, friendshipId)).returning())[0],
      Operation.Delete,
      DatabaseEntityType.Friend,
      friendshipId,
      "NOT_FOUND",
    );
    await callUserObjects([userId, friendId], (userObject) =>
      userObject.deleteFriend({ receiverId: friendId, senderId: userId }),
    );
  }),
  // Each friend's own topic too, since the list shows their name and image, which they change without touching it
  readFriends: getTopicsProcedure(standardAuthedProcedure, ({ ctx, output }) => [
    getTopic(TopicKind.Friend, ctx.user.id),
    ...z
      .array(publicUserSchema.pick({ id: true }))
      .parse(output)
      .map(({ id }) => getTopic(TopicKind.User, id)),
  ]).query<PublicUser[]>(({ ctx }) => {
    const userId = ctx.user.id;
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
  searchUsers: standardAuthedProcedure
    .meta({
      staticReason:
        "A name search, answered on each call rather than watched: a mutation names one user, never the users a search matches",
    })
    .input(searchUsersInputSchema)
    .query<PublicUser[]>(({ ctx, input: name }) => {
      const userId = ctx.user.id;
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
        .where(and(containsLike(usersInAuth.name, name), ne(usersInAuth.id, userId), isNull(blockedSubquery.id)))
        .limit(MAX_READ_LIMIT);
    }),
});
