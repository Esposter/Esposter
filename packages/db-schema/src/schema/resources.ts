import type { ResourceTags } from "@/models/resource/ResourceTags";

import { resourceTagsSchema } from "@/models/resource/ResourceTags";
import { ResourceType } from "@/models/resource/ResourceType";
import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
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
    contentVersion: integer().notNull().default(0),
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    tags: jsonb().notNull().default({}).$type<ResourceTags>(),
    type: resourceTypeEnum().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name, tags }) => [
      check("resources_name_length_check", createNameCheckSql(name, RESOURCE_NAME_MAX_LENGTH)),
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
