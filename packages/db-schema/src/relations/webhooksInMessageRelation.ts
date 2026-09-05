import type { RoomInMessage } from "#src/schema/roomsInMessage";
import type { User } from "#src/schema/users";
import type { WebhookInMessage } from "#src/schema/webhooksInMessage";

import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const webhooksInMessageRelation = defineRelationsPart(schema, (r) => ({
  webhooksInMessage: {
    appUser: r.one.appUsersInMessage({
      from: r.webhooksInMessage.userId,
      optional: false,
      to: r.appUsersInMessage.id,
    }),
    roomInMessage: r.one.roomsInMessage({
      from: r.webhooksInMessage.roomId,
      optional: false,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.webhooksInMessage.creatorId,
      optional: false,
      to: r.users.id,
    }),
  },
}));

export const WebhookInMessageRelations = {
  roomInMessage: true,
  user: true,
} as const;
// The row `WebhookInMessageRelations` actually produces, so a procedure returning one can declare it rather
// Than infer a shape the caller cannot name
export type WebhookInMessageWithRelations = WebhookInMessage & { roomInMessage: RoomInMessage; user: User };
