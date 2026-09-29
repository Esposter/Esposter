import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const bookmarksInAppRelation = defineRelationsPart(schema, (r) => ({
  bookmarksInApp: { user: r.one.usersInAuth({ from: r.bookmarksInApp.userId, optional: false, to: r.usersInAuth.id }) },
}));
