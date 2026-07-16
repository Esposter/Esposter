import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const invitesInMessageRelation = defineRelationsPart(schema, (r) => ({
  invitesInMessage: {
    roomInMessage: r.one.roomsInMessage({
      from: r.invitesInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.invitesInMessage.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const InviteInMessageRelations = {
  roomInMessage: {
    with: {
      usersToRoomsInMessage: true,
    },
  },
  user: true,
} as const;
