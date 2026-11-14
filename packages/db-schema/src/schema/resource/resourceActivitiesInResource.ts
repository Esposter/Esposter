import { ResourceActivityType } from "#src/models/resource/ResourceActivityType";
import { apiKeysInAuth } from "#src/schema/auth/apiKeysInAuth";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { createEnumColumn } from "#src/services/shared/createEnumColumn";
import { sqliteTable } from "#src/sqliteTable";
import { index, integer, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { v7 } from "uuid";
import { z } from "zod";

// The per-resource audit trail: one row per save, rename, restore and the rest, read newest-first
export const resourceActivitiesInResource = sqliteTable(
  "resourceActivities",
  {
    activityType: createEnumColumn(ResourceActivityType).notNull(),
    // The API key an agent came through. Null for the owner's own hand, and once the key is revoked
    apiKeyId: text().references(() => apiKeysInAuth.id, { onDelete: "set null" }),
    // The key's name as it was when the entry was written, so the trail reads the same after the key is revoked
    apiKeyName: text().notNull().default(""),
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    // Per-activityType payload, so every field is optional beside the ones its type never sets
    newName: text(),
    oldName: text(),
    publishVersion: integer(),
    resourceId: text()
      .notNull()
      .references(() => resourcesInResource.id, { onDelete: "cascade" }),
    // The user who made the change. Null once their account is gone, since the trail outlives the person who wrote it
    userId: text().references(() => usersInAuth.id, { onDelete: "set null" }),
  },
  {
    extraConfig: ({ apiKeyId, createdAt, id, resourceId, userId }) => [
      // A resource's trail pages newest-first, and its deletion cascades through it
      index("resourceActivities_resourceId_createdAt_id_index").on(resourceId, createdAt, id),
      index("resourceActivities_apiKeyId_index").on(apiKeyId),
      index("resourceActivities_userId_index").on(userId),
    ],
    schema: resourceSchema,
  },
);

export type ResourceActivityInResource = typeof resourceActivitiesInResource.$inferSelect;

export const selectResourceActivityInResourceSchema = createSelectSchema(resourceActivitiesInResource, {
  apiKeyId: (schema) => schema.nullable(),
  id: () => z.uuidv4(),
  resourceId: () => z.uuidv4(),
  userId: (schema) => schema.nullable(),
});
