import type { InviteInMessage } from "#src/schema/invitesInMessage";
import type { PublicUser } from "#src/models/user/PublicUser";

import { schema } from "#src/schema";
import { PublicUserColumns } from "#src/services/user/PublicUserColumns";
import { defineRelationsPart } from "drizzle-orm";

export const invitesInMessageRelation = defineRelationsPart(schema, (r) => ({
  invitesInMessage: {
    room: r.one.roomsInMessage({ from: r.invitesInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
    user: r.one.users({ from: r.invitesInMessage.userId, optional: false, to: r.users.id }),
  },
}));

// The room's memberships are counted, never read: the invite is readable by anyone holding its code, and a member's
// Row carries fields that are theirs alone
export const InviteInMessageRelations = {
  room: { with: { usersToRoomsInMessage: { columns: { userId: true } } } },
  user: { columns: PublicUserColumns },
} as const;
// The row plus whoever minted it, which is what a management surface lists — a code with no author beside it
// Says nothing about who to ask when it turns up somewhere it should not have
export type InviteInMessageWithCreator = InviteInMessage & { user: PublicUser };
