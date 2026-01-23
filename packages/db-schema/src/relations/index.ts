import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const relations = defineRelationsPart(schema, (r) => ({
  pushSubscriptionsInMessage: {
    user: r.one.users({
      from: r.pushSubscriptionsInMessage.userId,
      to: r.users.id,
    }),
  },
  roomsInMessage: {
    user: r.one.users({
      alias: "roomsInMessage_userId_users_id",
      from: r.roomsInMessage.userId,
      to: r.users.id,
    }),
    usersViaInvitesInMessage: r.many.users({
      alias: "roomsInMessage_id_users_id_via_invitesInMessage",
      from: r.roomsInMessage.id.through(r.invitesInMessage.roomId),
      to: r.users.id.through(r.invitesInMessage.userId),
    }),
    usersViaSearchHistoriesInMessage: r.many.users({
      alias: "roomsInMessage_id_users_id_via_searchHistoriesInMessage",
      from: r.roomsInMessage.id.through(r.searchHistoriesInMessage.roomId),
      to: r.users.id.through(r.searchHistoriesInMessage.userId),
    }),
    usersViaUsersToRoomsInMessage: r.many.users({
      alias: "roomsInMessage_id_users_id_via_usersToRoomsInMessage",
      from: r.roomsInMessage.id.through(r.usersToRoomsInMessage.roomId),
      to: r.users.id.through(r.usersToRoomsInMessage.userId),
    }),
    webhooksInMessages: r.many.webhooksInMessage(),
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
