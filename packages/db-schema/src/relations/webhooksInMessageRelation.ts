import type { RoomInMessage } from "@/schema/roomsInMessage";
import type { User } from "@/schema/users";
import type { WebhookInMessage } from "@/schema/webhooksInMessage";

import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const webhooksInMessageRelation = defineRelationsPart(schema, (r) => ({
  webhooksInMessage: {
    appUsersInMessage: r.one.appUsersInMessage({
      from: r.webhooksInMessage.userId,
      to: r.appUsersInMessage.id,
    }),
    roomInMessage: r.one.roomsInMessage({
      from: r.webhooksInMessage.roomId,
      to: r.roomsInMessage.id,
    }),
    user: r.one.users({
      from: r.webhooksInMessage.creatorId,
      to: r.users.id,
    }),
  },
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const WebhookInMessageRelations = {
  roomInMessage: true,
  user: true,
} as const;
export type WebhookInMessageWithRelations = WebhookInMessage & { roomInMessage: RoomInMessage; user: User };
