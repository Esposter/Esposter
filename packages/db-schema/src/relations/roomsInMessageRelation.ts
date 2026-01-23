import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const roomsInMessageRelation = defineRelationsPart(schema, (r) => ({
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
}));
