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

// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
// eslint-disable-next-line no-restricted-syntax -- the relation names a query's `with` takes, keyed as drizzle keys them
export const WebhookInMessageRelations = { creator: { columns: PublicUserColumns }, room: true } as const;
