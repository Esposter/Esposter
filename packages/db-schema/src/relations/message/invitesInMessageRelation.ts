import { schema } from "#src/generated/schema";
import { PublicUserColumns } from "#src/services/user/PublicUserColumns";
import { defineRelationsPart } from "drizzle-orm";

export const invitesInMessageRelation = defineRelationsPart(schema, (r) => ({
  invitesInMessage: {
    room: r.one.roomsInMessage({ from: r.invitesInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
    user: r.one.usersInAuth({ from: r.invitesInMessage.userId, optional: false, to: r.usersInAuth.id }),
  },
}));

// The room's memberships are counted, never read: the invite is readable by anyone holding its code, and a member's
// Row carries fields that are theirs alone
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const InviteInMessageRelations = {
  room: { with: { usersToRoomsInMessage: { columns: { userId: true } } } },
  user: { columns: PublicUserColumns },
} as const;
