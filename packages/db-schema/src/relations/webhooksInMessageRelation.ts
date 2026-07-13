import { schema } from "@/schema";
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
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const WebhookInMessageRelations = {
  roomInMessage: true,
  user: true,
} as const;
