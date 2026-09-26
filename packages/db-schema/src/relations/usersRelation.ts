import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const usersRelation = defineRelationsPart(schema, (r) => ({
  users: {
    accounts: r.many.accounts({ from: r.users.id, to: r.accounts.userId }),
    achievementsViaUserAchievements: r.many.achievements({
      alias: "achievements_id_users_id_via_userAchievements",
      from: r.users.id.through(r.userAchievements.userId),
      to: r.achievements.id.through(r.userAchievements.achievementId),
    }),
    bansInMessage: r.many.bansInMessage({ from: r.users.id, to: r.bansInMessage.userId }),
    blocks: r.many.blocks({ from: r.users.id, to: r.blocks.blockerId }),
    callSessionsInMessage: r.many.callSessionsInMessage({ from: r.users.id, to: r.callSessionsInMessage.userId }),
    friendRequests: r.many.friendRequests({ from: r.users.id, to: r.friendRequests.senderId }),
    postsViaLikes: r.many.posts({
      alias: "posts_id_users_id_via_likes",
      from: r.users.id.through(r.likes.userId),
      to: r.posts.id.through(r.likes.postId),
    }),
    postsViaPosts: r.many.posts({
      alias: "posts_id_users_id_via_posts",
      from: r.users.id.through(r.posts.userId),
      to: r.posts.id.through(r.posts.parentId),
    }),
    pushSubscriptions: r.many.pushSubscriptions({ from: r.users.id, to: r.pushSubscriptions.userId }),
    receivedFriendRequests: r.many.friendRequests({ from: r.users.id, to: r.friendRequests.receiverId }),
    roomCategoriesInMessage: r.many.roomCategoriesInMessage({ from: r.users.id, to: r.roomCategoriesInMessage.userId }),
    roomsInMessage: r.many.roomsInMessage({ from: r.users.id, to: r.roomsInMessage.userId }),
    roomsInMessageViaInvitesInMessage: r.many.roomsInMessage({
      alias: "roomsInMessage_id_users_id_via_invitesInMessage",
      from: r.users.id.through(r.invitesInMessage.userId),
      to: r.roomsInMessage.id.through(r.invitesInMessage.roomId),
    }),
    roomsInMessageViaSearchHistoriesInMessage: r.many.roomsInMessage({
      alias: "roomsInMessage_id_users_id_via_searchHistoriesInMessage",
      from: r.users.id.through(r.searchHistoriesInMessage.userId),
      to: r.roomsInMessage.id.through(r.searchHistoriesInMessage.roomId),
    }),
    roomsInMessageViaUsersToRoomsInMessage: r.many.roomsInMessage({
      alias: "roomsInMessage_id_users_id_via_usersToRoomsInMessage",
      from: r.users.id.through(r.usersToRoomsInMessage.userId),
      to: r.roomsInMessage.id.through(r.usersToRoomsInMessage.roomId),
    }),
    sessions: r.many.sessions({ from: r.users.id, to: r.sessions.userId }),
    userAchievements: r.many.userAchievements({ from: r.users.id, to: r.userAchievements.userId }),
    userStatusesInMessage: r.many.userStatusesInMessage({ from: r.users.id, to: r.userStatusesInMessage.userId }),
    usersToRoomRolesInMessage: r.many.usersToRoomRolesInMessage({
      from: r.users.id,
      to: r.usersToRoomRolesInMessage.userId,
    }),
    webhooksInMessage: r.many.webhooksInMessage({ from: r.users.id, to: r.webhooksInMessage.creatorId }),
  },
}));
