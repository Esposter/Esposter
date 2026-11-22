import type { FriendInSocial, FriendInSocialWithRelations, Page, PublicUser } from "@esposter/db-schema";

import { containsLike } from "#server/services/db/containsLike";
import { assertIsNotSelf } from "#server/services/friend/assertIsNotSelf";
import { getLiveBlockWhere } from "#server/services/friend/getLiveBlockWhere";
import { getLiveFriendshipWhere } from "#server/services/friend/getLiveFriendshipWhere";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import { SEARCH_USERS_PAGE_SORT, searchUsersInputSchema } from "#shared/models/db/friend/SearchUsersInput";
import { createPageSort, getPageOrderBy, getPageWhere, toPage } from "@esposter/db";
import {
  blocksInSocial,
  DatabaseEntityType,
  FriendInSocialRelations,
  friendsInSocial,
  getPublicUserColumns,
  usersInAuth,
} from "@esposter/db-schema";
import { getFriendshipId, Operation } from "@esposter/shared";
import { and, eq, isNull, ne, sql } from "drizzle-orm";

export const friendRouter = router({
  deleteFriend: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<FriendInSocial>(async ({ ctx, input: friendId }) => {
      const userId = ctx.user.id;
      assertIsNotSelf(Operation.Delete, DatabaseEntityType.Friend, userId, friendId);

      // A removal keeps the friendship as a tombstone, so its version rises and a later arrival of the row loses to it
      const friendshipId = getFriendshipId(userId, friendId);
      return requireMutation(
        (
          await ctx.db
            .update(friendsInSocial)
            .set({ deletedAt: new Date() })
            .where(getLiveFriendshipWhere(friendshipId))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.Friend,
        friendshipId,
        "NOT_FOUND",
      );
    }),
  // A friend's name and image are on their user row, which the relation reads on each call, so a rename reaches the
  // List. A removed friendship stays in this read as a tombstone, so the client applies its removal
  readFriends: standardAuthedProcedure.query<FriendInSocialWithRelations[]>(({ ctx }) => {
    const userId = ctx.user.id;
    return ctx.db.query.friendsInSocial.findMany({
      where: { OR: [{ receiverId: { eq: userId } }, { senderId: { eq: userId } }] },
      with: FriendInSocialRelations,
    });
  }),
  searchUsers: standardAuthedProcedure
    .meta({
      staticReason:
        "A name search, answered on each call rather than watched: a mutation names one user, never the users a search matches",
    })
    .input(searchUsersInputSchema)
    .query<Page<PublicUser>>(async ({ ctx, input: { cursor, limit, name } }) => {
      const userId = ctx.user.id;
      const blockedSubquery = ctx.db
        .select({ id: blocksInSocial.blockedId })
        .from(blocksInSocial)
        .where(getLiveBlockWhere({ blockerId: userId }))
        .union(
          ctx.db
            .select({ id: blocksInSocial.blockerId })
            .from(blocksInSocial)
            .where(getLiveBlockWhere({ blockedId: userId })),
        )
        .as("blocked_users");
      // The name compares without case, as the room search's names do
      const boundSort = createPageSort(
        { id: usersInAuth.id, name: sql<string>`${usersInAuth.name} collate nocase` },
        SEARCH_USERS_PAGE_SORT,
      );
      const rows = await ctx.db
        .select(getPublicUserColumns(usersInAuth))
        .from(usersInAuth)
        .leftJoin(blockedSubquery, eq(blockedSubquery.id, usersInAuth.id))
        .where(
          and(
            containsLike(usersInAuth.name, name),
            ne(usersInAuth.id, userId),
            isNull(blockedSubquery.id),
            getPageWhere(boundSort, cursor),
          ),
        )
        .orderBy(...getPageOrderBy(boundSort, cursor))
        .limit(limit + 1);
      return toPage(rows, SEARCH_USERS_PAGE_SORT, cursor, limit);
    }),
});
