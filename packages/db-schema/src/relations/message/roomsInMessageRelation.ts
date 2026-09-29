import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const roomsInMessageRelation = defineRelationsPart(schema, (r) => ({
  roomsInMessage: {
    bansInMessage: r.many.bansInMessage({ from: r.roomsInMessage.id, to: r.bansInMessage.roomId }),
    category: r.one.roomCategoriesInMessage({
      from: r.roomsInMessage.categoryId,
      optional: true,
      to: r.roomCategoriesInMessage.id,
    }),
    roomRolesInMessage: r.many.roomRolesInMessage({ from: r.roomsInMessage.id, to: r.roomRolesInMessage.roomId }),
    user: r.one.usersInAuth({ from: r.roomsInMessage.userId, optional: false, to: r.usersInAuth.id }),
    usersToRoomRolesInMessage: r.many.usersToRoomRolesInMessage({
      from: r.roomsInMessage.id,
      to: r.usersToRoomRolesInMessage.roomId,
    }),
    usersToRoomsInMessage: r.many.usersToRoomsInMessage({
      from: r.roomsInMessage.id,
      to: r.usersToRoomsInMessage.roomId,
    }),
    usersViaInvitesInMessage: r.many.usersInAuth({
      alias: "roomsInMessage_id_users_id_via_invitesInMessage",
      from: r.roomsInMessage.id.through(r.invitesInMessage.roomId),
      to: r.usersInAuth.id.through(r.invitesInMessage.userId),
    }),
    usersViaSearchHistoriesInMessage: r.many.usersInAuth({
      alias: "roomsInMessage_id_users_id_via_searchHistoriesInMessage",
      from: r.roomsInMessage.id.through(r.searchHistoriesInMessage.roomId),
      to: r.usersInAuth.id.through(r.searchHistoriesInMessage.userId),
    }),
    usersViaUsersToRoomsInMessage: r.many.usersInAuth({
      alias: "roomsInMessage_id_users_id_via_usersToRoomsInMessage",
      from: r.roomsInMessage.id.through(r.usersToRoomsInMessage.roomId),
      to: r.usersInAuth.id.through(r.usersToRoomsInMessage.userId),
    }),
    webhooksInMessage: r.many.webhooksInMessage({ from: r.roomsInMessage.id, to: r.webhooksInMessage.roomId }),
  },
}));
