import type { ResourceTags } from "#src/models/resource/ResourceTags";

import { resourceTagsSchema } from "#src/models/resource/ResourceTags";
import { ResourceType } from "#src/models/resource/ResourceType";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { RESOURCE_NAME_MAX_LENGTH } from "#src/services/resource/constants";
import { createEnumColumn } from "#src/services/shared/createEnumColumn";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { createNameSchema } from "#src/services/shared/createNameSchema";
import { sqliteTable } from "#src/sqliteTable";
import { check, index, integer, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { v7 } from "uuid";
import { z } from "zod";

// Pure identity + content lifecycle. Publish state is normalized into resourcePublications
// Because publishing is an opt-in capability — not every resource type has it.
export const resourcesInResource = sqliteTable(
  "resources",
  {
    // The hex SHA-256 of the content's JSON — what the blob's zstd frame decodes to — written in the transaction
    // That writes the blob. A save hands it back so a client can tell whether the bytes it sent are the bytes
    // Stored, which is what a delta save is computed against; empty until the first content write.
    // Design: openspec/specs/resource/resource-version-store/design.md
    contentHash: text().notNull().default(""),
    // The byte length of the content's JSON, written with its hash — not the compressed length the blob is stored
    // And charged at. A client picks how a read crosses by it the way a save picks by the body it would send: a
    // Document one request body carries comes through the server, a larger one straight from R2.
    // Design: openspec/specs/architecture/large-documents/design.md
    contentSize: integer().notNull().default(0),
    contentVersion: integer().notNull().default(0),
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    name: text().notNull(),
    // When the last revision was taken, which is what throttles the automatic ones. The save clock cannot
    // Answer it: `updatedAt` moves on every autosave, so a continuously edited resource never looks idle and
    // Leaves no recovery points at all. Null until the first revision lands.
    // Design: openspec/specs/resource/resource-snapshots/design.md
    revisionTakenAt: integer({ mode: "timestamp_ms" }),
    // The revision channel's counter: what the next revision is numbered. Never derived from the version rows,
    // Which answer which revisions exist — a number is claimed before its write, so a failed write leaves a
    // Number with no row, and the ring-buffer eviction makes the two disagree by design.
    // See openspec/specs/resource/resource-snapshots/design.md
    revisionVersion: integer().notNull().default(0),
    tags: text({ mode: "json" }).notNull().default({}).$type<ResourceTags>(),
    type: createEnumColumn(ResourceType).notNull(),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ createdAt, deletedAt, id, name, type, updatedAt, userId }) => [
      check("resources_name_length_check", createNameCheckSql(name, RESOURCE_NAME_MAX_LENGTH)),
      // Every owner's list is ordered by one of its columns with the id breaking ties, so each sort a list offers is an
      // Index led by the owner: the owner's rows, the cascade of a user's deletion and every count land on these too
      index("resources_userId_createdAt_id_index").on(userId, createdAt, id),
      index("resources_userId_deletedAt_id_index").on(userId, deletedAt, id),
      index("resources_userId_name_id_index").on(userId, name, id),
      index("resources_userId_type_id_index").on(userId, type, id),
      index("resources_userId_updatedAt_id_index").on(userId, updatedAt, id),
    ],
    schema: resourceSchema,
  },
);

export type ResourceInResource = typeof resourcesInResource.$inferSelect;

export const selectResourceInResourceSchema = createSelectSchema(resourcesInResource, {
  id: () => z.uuidv7(),
  name: (schema) => createNameSchema(RESOURCE_NAME_MAX_LENGTH, schema),
  tags: resourceTagsSchema,
});
