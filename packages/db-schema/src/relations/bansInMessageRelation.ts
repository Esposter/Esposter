import type { BanInMessage } from "#src/schema/bansInMessage";
import type { PublicUser } from "#src/models/user/PublicUser";

import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const bansInMessageRelation = defineRelationsPart(schema, (r) => ({
  bansInMessage: {
    bannedByUser: r.one.users({ from: r.bansInMessage.bannedByUserId, optional: true, to: r.users.id }),
    room: r.one.roomsInMessage({ from: r.bansInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
    user: r.one.users({ from: r.bansInMessage.userId, optional: false, to: r.users.id }),
  },
}));

export type BanInMessageWithUsers = BanInMessage & { bannedByUser: null | PublicUser; user: PublicUser };
