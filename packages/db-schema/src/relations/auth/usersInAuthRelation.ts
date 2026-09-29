import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const usersInAuthRelation = defineRelationsPart(schema, (r) => ({
  usersInAuth: {
    accountsInAuth: r.many.accountsInAuth({ from: r.usersInAuth.id, to: r.accountsInAuth.userId }),
    achievementsViaUserAchievements: r.many.achievementsInAchievement({
      alias: "achievements_id_users_id_via_userAchievements",
      from: r.usersInAuth.id.through(r.userAchievementsInAchievement.userId),
      to: r.achievementsInAchievement.id.through(r.userAchievementsInAchievement.achievementId),
    }),
    bansInMessage: r.many.bansInMessage({ from: r.usersInAuth.id, to: r.bansInMessage.userId }),
    blocks: r.many.blocksInSocial({ from: r.usersInAuth.id, to: r.blocksInSocial.blockerId }),
    callSessionsInMessage: r.many.callSessionsInMessage({ from: r.usersInAuth.id, to: r.callSessionsInMessage.userId }),
    friendRequests: r.many.friendRequestsInSocial({ from: r.usersInAuth.id, to: r.friendRequestsInSocial.senderId }),
    postsViaLikes: r.many.postsInPost({
      alias: "posts_id_users_id_via_likes",
      from: r.usersInAuth.id.through(r.likesInPost.userId),
      to: r.postsInPost.id.through(r.likesInPost.postId),
    }),
    postsViaPosts: r.many.postsInPost({
      alias: "posts_id_users_id_via_posts",
      from: r.usersInAuth.id.through(r.postsInPost.userId),
      to: r.postsInPost.id.through(r.postsInPost.parentId),
    }),
    pushSubscriptions: r.many.pushSubscriptionsInNotification({
      from: r.usersInAuth.id,
      to: r.pushSubscriptionsInNotification.userId,
    }),
    receivedFriendRequests: r.many.friendRequestsInSocial({
      from: r.usersInAuth.id,
      to: r.friendRequestsInSocial.receiverId,
    }),
    roomCategoriesInMessage: r.many.roomCategoriesInMessage({
      from: r.usersInAuth.id,
      to: r.roomCategoriesInMessage.userId,
    }),
    roomsInMessage: r.many.roomsInMessage({ from: r.usersInAuth.id, to: r.roomsInMessage.userId }),
    roomsInMessageViaInvitesInMessage: r.many.roomsInMessage({
      alias: "roomsInMessage_id_users_id_via_invitesInMessage",
      from: r.usersInAuth.id.through(r.invitesInMessage.userId),
      to: r.roomsInMessage.id.through(r.invitesInMessage.roomId),
    }),
    roomsInMessageViaSearchHistoriesInMessage: r.many.roomsInMessage({
      alias: "roomsInMessage_id_users_id_via_searchHistoriesInMessage",
      from: r.usersInAuth.id.through(r.searchHistoriesInMessage.userId),
      to: r.roomsInMessage.id.through(r.searchHistoriesInMessage.roomId),
    }),
    roomsInMessageViaUsersToRoomsInMessage: r.many.roomsInMessage({
      alias: "roomsInMessage_id_users_id_via_usersToRoomsInMessage",
      from: r.usersInAuth.id.through(r.usersToRoomsInMessage.userId),
      to: r.roomsInMessage.id.through(r.usersToRoomsInMessage.roomId),
    }),
    sessionsInAuth: r.many.sessionsInAuth({ from: r.usersInAuth.id, to: r.sessionsInAuth.userId }),
    userAchievements: r.many.userAchievementsInAchievement({
      from: r.usersInAuth.id,
      to: r.userAchievementsInAchievement.userId,
    }),
    userStatusesInMessage: r.many.userStatusesInMessage({ from: r.usersInAuth.id, to: r.userStatusesInMessage.userId }),
    usersToRoomRolesInMessage: r.many.usersToRoomRolesInMessage({
      from: r.usersInAuth.id,
      to: r.usersToRoomRolesInMessage.userId,
    }),
    webhooksInMessage: r.many.webhooksInMessage({ from: r.usersInAuth.id, to: r.webhooksInMessage.creatorId }),
  },
}));
