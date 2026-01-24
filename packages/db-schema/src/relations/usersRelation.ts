import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const usersRelation = defineRelationsPart(schema, (r) => ({
  users: {
    accounts: r.many.accounts({
      from: r.users.id,
      to: r.accounts.userId,
    }),
    achievementsViaUserAchievements: r.many.achievements({
      alias: "achievements_id_users_id_via_userAchievements",
      from: r.users.id.through(r.userAchievements.userId),
      to: r.achievements.id.through(r.userAchievements.achievementId),
    }),
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
    pushSubscriptionsInMessages: r.many.pushSubscriptionsInMessage({
      from: r.users.id,
      to: r.pushSubscriptionsInMessage.userId,
    }),
    roomsInMessages: r.many.roomsInMessage({
      from: r.users.id,
      to: r.roomsInMessage.userId,
    }),
    roomsInMessagesViaInvitesInMessage: r.many.roomsInMessage({
      alias: "roomsInMessage_id_users_id_via_invitesInMessage",
      from: r.users.id.through(r.invitesInMessage.userId),
      to: r.roomsInMessage.id.through(r.invitesInMessage.roomId),
    }),
    roomsInMessagesViaSearchHistoriesInMessage: r.many.roomsInMessage({
      alias: "roomsInMessage_id_users_id_via_searchHistoriesInMessage",
      from: r.users.id.through(r.searchHistoriesInMessage.userId),
      to: r.roomsInMessage.id.through(r.searchHistoriesInMessage.roomId),
    }),
    roomsInMessagesViaUsersToRoomsInMessage: r.many.roomsInMessage({
      alias: "roomsInMessage_id_users_id_via_usersToRoomsInMessage",
      from: r.users.id.through(r.usersToRoomsInMessage.userId),
      to: r.roomsInMessage.id.through(r.usersToRoomsInMessage.roomId),
    }),
    sessions: r.many.sessions({
      from: r.users.id,
      to: r.sessions.userId,
    }),
    surveys: r.many.surveys({
      from: r.users.id,
      to: r.surveys.userId,
    }),
    userAchievements: r.many.userAchievements({
      from: r.users.id,
      to: r.userAchievements.userId,
    }),
    userStatusesInMessages: r.many.userStatusesInMessage({
      from: r.users.id,
      to: r.userStatusesInMessage.userId,
    }),
    webhooksInMessages: r.many.webhooksInMessage({
      from: r.users.id,
      to: r.webhooksInMessage.userId,
    }),
  },
}));
