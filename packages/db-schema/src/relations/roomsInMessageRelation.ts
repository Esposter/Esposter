import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const roomsInMessageRelation = defineRelationsPart(schema, (r) => ({
  roomsInMessage: {
    bansInMessages: r.many.bansInMessage({
      from: r.roomsInMessage.id,
      to: r.bansInMessage.roomId,
    }),
    category: r.one.roomCategoriesInMessage({
      from: r.roomsInMessage.categoryId,
      optional: true,
      to: r.roomCategoriesInMessage.id,
    }),
    roomRolesInMessages: r.many.roomRolesInMessage({
      from: r.roomsInMessage.id,
      to: r.roomRolesInMessage.roomId,
    }),
    user: r.one.users({
      from: r.roomsInMessage.userId,
      optional: false,
      to: r.users.id,
    }),
    usersToRoomRolesInMessages: r.many.usersToRoomRolesInMessage({
      from: r.roomsInMessage.id,
      to: r.usersToRoomRolesInMessage.roomId,
    }),
    usersToRoomsInMessage: r.many.usersToRoomsInMessage({
      from: r.roomsInMessage.id,
      to: r.usersToRoomsInMessage.roomId,
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
    webhooksInMessages: r.many.webhooksInMessage({
      from: r.roomsInMessage.id,
      to: r.webhooksInMessage.roomId,
    }),
  },
}));
