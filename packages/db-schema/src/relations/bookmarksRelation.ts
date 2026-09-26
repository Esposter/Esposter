import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const bookmarksRelation = defineRelationsPart(schema, (r) => ({
  bookmarks: { user: r.one.users({ from: r.bookmarks.userId, optional: false, to: r.users.id }) },
}));
