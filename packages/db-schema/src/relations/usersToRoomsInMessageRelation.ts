import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const usersToRoomsInMessageRelation = defineRelationsPart(schema, (r) => ({
  usersToRoomsInMessage: {
    room: r.one.roomsInMessage({
      from: r.usersToRoomsInMessage.roomId,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.usersToRoomsInMessage.userId,
      to: r.users.id,
    }),
  },
}));
