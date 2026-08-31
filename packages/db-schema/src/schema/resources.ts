import type { ResourceTags } from "#src/models/resource/ResourceTags";

import { resourceTagsSchema } from "#src/models/resource/ResourceTags";
import { ResourceType } from "#src/models/resource/ResourceType";
import { createNameCheckSql, createNameSchema } from "#src/models/shared/Name";
import { pgTable } from "#src/pgTable";
import { users } from "#src/schema/users";
import { sql } from "drizzle-orm";
import { check, index, integer, jsonb, pgEnum, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const RESOURCE_NAME_MAX_LENGTH = 100;

export const resourceTypeEnum = pgEnum("resourceType", ResourceType);
// Pure identity + content lifecycle. Publish state is normalized into resourcePublications
// Because publishing is an opt-in capability — not every resource type has it.
export const resources = pgTable(
  "resources",
  {
    // The one cross-resource link promoted out of blob content into a column, because it is the only one read
    // On an unauthenticated path: `resolveIdentifiedToken` has to know which Programs are bound to a Survey
    // Before it can decide whether a participant token was issued for it, and answering that from blobs means
    // Reading every one of the owner's Programs on every submission. No foreign key — a binding is a bare id
    // Re-resolved on read, so a deleted target fails soft rather than stranding the row
    boundResourceId: uuid(),
    contentVersion: integer().notNull().default(0),
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    // The revision channel's counter, and the only thing about a revision that is not in its own blob — its
    // Reason and label ride as blob metadata, so there is no revisions table. Never derived from the blob
    // Listing: the listing answers which revisions exist, this answers what the next one is numbered, and a
    // Ring-buffer eviction makes the two disagree by design. See /docs/platform/resource-snapshots
    revisionVersion: integer().notNull().default(0),
    tags: jsonb().notNull().default({}).$type<ResourceTags>(),
    type: resourceTypeEnum().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ boundResourceId, name, tags, type, userId }) => [
      check("resources_name_length_check", createNameCheckSql(name, RESOURCE_NAME_MAX_LENGTH)),
      // The exact shape resolveIdentifiedToken asks for — the owner's resources of one type bound to one
      // Target. Partial, because only a bound resource is ever looked up this way and the column is null
      // For every resource type that has no binding at all
      index("resources_bound_resource_index")
        .on(userId, type, boundResourceId)
        .where(sql`${boundResourceId} is not null`),
      // GIN backs the `tags @> input` containment filter behind the /all Tag pill
      index("resources_tags_index").using("gin", tags),
      // Trigram GIN backs similarity() ranking in global search, so a typo still finds the resource.
      // The pg_trgm extension itself is created by the migration — drizzle has no schema-level concept of it.
      index("resources_name_trgm_index").using("gin", sql`${name} gin_trgm_ops`),
    ],
  },
);

export type Resource = typeof resources.$inferSelect;

export const selectResourceSchema = createSelectSchema(resources, {
  name: (schema) => createNameSchema(RESOURCE_NAME_MAX_LENGTH, schema),
  tags: resourceTagsSchema,
});
