import { schema } from "#src/generated/schema";
import { PublicUserColumns } from "#src/services/user/PublicUserColumns";
import { defineRelationsPart } from "drizzle-orm";

export const webhooksInMessageRelation = defineRelationsPart(schema, (r) => ({
  webhooksInMessage: {
    creator: r.one.usersInAuth({ from: r.webhooksInMessage.creatorId, optional: false, to: r.usersInAuth.id }),
    room: r.one.roomsInMessage({ from: r.webhooksInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
    user: r.one.appUsersInMessage({ from: r.webhooksInMessage.userId, optional: false, to: r.appUsersInMessage.id }),
  },
}));

// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
// The relation names a query's `with` takes, keyed as drizzle keys them
// oxlint-disable-next-line selector-ban/no-restricted-syntax -- drizzle keys a `with` by its relation names
export const WebhookInMessageRelations = { creator: { columns: PublicUserColumns }, room: true } as const;
