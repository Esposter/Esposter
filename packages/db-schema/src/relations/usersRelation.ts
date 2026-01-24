import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const usersRelation = defineRelationsPart(schema, (r) => ({
  users: {
    accounts: r.many.accounts(),
    achievements: r.many.achievements(),
    postsViaLikes: r.many.posts({
      alias: "posts_id_users_id_via_likes",
    }),
    postsViaPosts: r.many.posts({
      alias: "posts_id_users_id_via_posts",
    }),
    pushSubscriptionsInMessages: r.many.pushSubscriptionsInMessage(),
    roomsInMessagesUserId: r.many.roomsInMessage({
      alias: "roomsInMessage_userId_users_id",
    }),
    roomsInMessagesViaInvitesInMessage: r.many.roomsInMessage({
      alias: "roomsInMessage_id_users_id_via_invitesInMessage",
    }),
    roomsInMessagesViaSearchHistoriesInMessage: r.many.roomsInMessage({
      alias: "roomsInMessage_id_users_id_via_searchHistoriesInMessage",
    }),
    roomsInMessagesViaUsersToRoomsInMessage: r.many.roomsInMessage({
      alias: "roomsInMessage_id_users_id_via_usersToRoomsInMessage",
    }),
    sessions: r.many.sessions(),
    surveys: r.many.surveys(),
    userAchievements: r.many.userAchievements(),
    userStatusesInMessages: r.many.userStatusesInMessage(),
    webhooksInMessages: r.many.webhooksInMessage(),
  },
}));
