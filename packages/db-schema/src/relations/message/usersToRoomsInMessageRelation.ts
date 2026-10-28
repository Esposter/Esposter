import { schema } from "#src/generated/schema";
import { PublicUserColumns } from "#src/services/user/PublicUserColumns";
import { defineRelationsPart } from "drizzle-orm";

export const usersToRoomsInMessageRelation = defineRelationsPart(schema, (r) => ({
  usersToRoomsInMessage: {
    room: r.one.roomsInMessage({ from: r.usersToRoomsInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
    user: r.one.usersInAuth({ from: r.usersToRoomsInMessage.userId, optional: false, to: r.usersInAuth.id }),
  },
}));

// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const UserToRoomInMessageRelations = { room: true, user: { columns: PublicUserColumns } } as const;
