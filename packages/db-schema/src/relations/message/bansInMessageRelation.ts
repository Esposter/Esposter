import type { PublicUser } from "#src/models/user/PublicUser";
import type { BanInMessage } from "#src/schema/message/bansInMessage";

import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const bansInMessageRelation = defineRelationsPart(schema, (r) => ({
  bansInMessage: {
    bannedByUser: r.one.usersInAuth({ from: r.bansInMessage.bannedByUserId, optional: true, to: r.usersInAuth.id }),
    room: r.one.roomsInMessage({ from: r.bansInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
    user: r.one.usersInAuth({ from: r.bansInMessage.userId, optional: false, to: r.usersInAuth.id }),
  },
}));

export type BanInMessageWithUsers = BanInMessage & { bannedByUser: null | PublicUser; user: PublicUser };
