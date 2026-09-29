import type { PublicUser } from "#src/models/user/PublicUser";
import type { RoomInMessage } from "#src/schema/message/roomsInMessage";
import type { WebhookInMessage } from "#src/schema/message/webhooksInMessage";

import { schema } from "#src/generated/schema";
import { PublicUserColumns } from "#src/services/user/PublicUserColumns";
import { defineRelationsPart } from "drizzle-orm";

export const webhooksInMessageRelation = defineRelationsPart(schema, (r) => ({
  webhooksInMessage: {
    appUser: r.one.appUsersInMessage({ from: r.webhooksInMessage.userId, optional: false, to: r.appUsersInMessage.id }),
    creator: r.one.usersInAuth({ from: r.webhooksInMessage.creatorId, optional: false, to: r.usersInAuth.id }),
    room: r.one.roomsInMessage({ from: r.webhooksInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
  },
}));

export const WebhookInMessageRelations = { creator: { columns: PublicUserColumns }, room: true } as const;
// The row `WebhookInMessageRelations` actually produces, so a procedure returning one can declare it rather
// Than infer a shape the caller cannot name
export type WebhookInMessageWithRelations = WebhookInMessage & { creator: PublicUser; room: RoomInMessage };
