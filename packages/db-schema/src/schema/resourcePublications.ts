import { pgTable } from "@/pgTable";
import { resources } from "@/schema/resources";
import { integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

// A row exists iff the resource is currently published — this is the Publishable capability's state.
// PublishVersion keys the immutable published blob snapshot ({id}/published/{publishVersion}).
export const resourcePublications = pgTable("resource_publications", {
  publishedAt: timestamp().notNull().defaultNow(),
  publishVersion: integer().notNull().default(1),
  resourceId: uuid()
    .primaryKey()
    .references(() => resources.id, { onDelete: "cascade" }),
});

export type ResourcePublication = typeof resourcePublications.$inferSelect;

export const selectResourcePublicationSchema = createSelectSchema(resourcePublications);
