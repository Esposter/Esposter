import type { InviteInMessage } from "#src/schema/invitesInMessage";
import type { User } from "#src/schema/users";

import { schema } from "#src/schema";
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

export const InviteInMessageRelations = {
  roomInMessage: {
    with: {
      usersToRoomsInMessage: true,
    },
  },
  user: true,
} as const;

// The row plus whoever minted it, which is what a management surface lists — a code with no author beside it
// Says nothing about who to ask when it turns up somewhere it should not have
export type InviteInMessageWithCreator = InviteInMessage & { user: User };
