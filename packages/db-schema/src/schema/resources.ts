import type { ResourceTags } from "#src/models/resource/ResourceTags";

import { resourceTagsSchema } from "#src/models/resource/ResourceTags";
import { ResourceType } from "#src/models/resource/ResourceType";
import { createNameSchema } from "#src/models/shared/Name";
import { pgTable } from "#src/pgTable";
import { users } from "#src/schema/users";
import { RESOURCE_NAME_MAX_LENGTH } from "#src/services/resource/constants";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { sql } from "drizzle-orm";
import { check, index, integer, jsonb, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const resourceTypeEnum = pgEnum("resourceType", ResourceType);
// Pure identity + content lifecycle. Publish state is normalized into resourcePublications
// Because publishing is an opt-in capability — not every resource type has it.
export const resources = pgTable(
  "resources",
  {
    // The one cross-resource link promoted out of blob content into a column, because it is the only one read
    // On an unauthenticated path: `resolveIdentifiedToken` has to know which Programs are bound to a Survey
    // Before it can decide whether a participant token was issued for it, and answering that from blobs means
    // Reading every one of the owner's Programs on every submission. No foreign key — the binding is projected
    // From the content on every save, so a `set null` on the target's deletion would have the next save rewrite
    // The dangling id and fail on the constraint; a bare id re-resolved on read fails soft instead
    boundResourceId: uuid(),
    // The hex SHA-256 of the content blob's bytes, written in the transaction that writes the blob. A save hands
    // It back so a client can tell whether the bytes it sent are the bytes stored, which is what a delta save is
    // Computed against; empty until the first content write. See /docs/resource/resource-version-store
    contentHash: text().notNull().default(""),
    // The content blob's byte length, written with its hash. A client picks how a read crosses by it the way a
    // Save picks by the body it would send: a document one request body carries comes through the server, a
    // Larger one straight from Blob Storage. See /docs/architecture/large-documents
    contentSize: integer().notNull().default(0),
    contentVersion: integer().notNull().default(0),
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    // When the last revision was taken, which is what throttles the automatic ones. The save clock cannot
    // Answer it: `updatedAt` moves on every autosave, so a continuously edited resource never looks idle and
    // Leaves no recovery points at all. Null until the first revision lands. See /docs/resource/resource-snapshots
    revisionTakenAt: timestamp(),
    // The revision channel's counter: what the next revision is numbered. Never derived from the version rows,
    // Which answer which revisions exist — a number is claimed before its write, so a failed write leaves a
    // Number with no row, and the ring-buffer eviction makes the two disagree by design.
    // See /docs/resource/resource-snapshots
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
