import { pgTable } from "#src/pgTable";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { index, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

// A row exists iff the user has opened the resource, and holds when they last did. Server-side rather than
// Per-device, because Recent is a list surface of its own with a Last accessed column — a column that
// Disagreed between two browsers is harder to defend than a card that quietly did.
// Deliberately not called a view: `ResourceViewEntity` counts anonymous hits on a *published* resource,
// While this records the owner opening their own. One row per user per resource, rewritten on every open,
// So the table stays bounded by what exists rather than growing with traffic.
export const resourceAccessesInResource = pgTable(
  "resourceAccesses",
  {
    accessedAt: timestamp().notNull().defaultNow(),
    resourceId: uuid()
      .notNull()
      .references(() => resourcesInResource.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ accessedAt, resourceId, userId }) => [
      primaryKey({ columns: [userId, resourceId] }),
      // Recent is "this user's rows, newest first", and the primary key orders by resourceId — without this
      // The sort re-reads and re-sorts every resource the user has ever opened
      index("resourceAccesses_userId_accessedAt_index").on(userId, accessedAt),
    ],
    schema: resourceSchema,
  },
);

export type ResourceAccessInResource = typeof resourceAccessesInResource.$inferSelect;
