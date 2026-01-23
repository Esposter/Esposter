import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

const relations = defineRelationsPart(schema, (r) => ({
  pushSubscriptionsInMessage: {
    user: r.one.users({
      from: r.pushSubscriptionsInMessage.userId,
      to: r.users.id,
    }),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },
  surveys: {
    user: r.one.users({
      from: r.surveys.userId,
      to: r.users.id,
    }),
  },
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
    userStatusesInMessages: r.many.userStatusesInMessage(),
    webhooksInMessages: r.many.webhooksInMessage(),
  },
  userStatusesInMessage: {
    user: r.one.users({
      from: r.userStatusesInMessage.userId,
      to: r.users.id,
    }),
  },
  webhooksInMessage: {
    appUsersInMessage: r.one.appUsersInMessage({
      from: r.webhooksInMessage.userId,
      to: r.appUsersInMessage.id,
    }),
    roomsInMessage: r.one.roomsInMessage({
      from: r.webhooksInMessage.roomId,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.webhooksInMessage.creatorId,
      to: r.users.id,
    }),
  },
}));
