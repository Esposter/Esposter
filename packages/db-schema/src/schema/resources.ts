import { ResourceType } from "@/models/resource/ResourceType";
import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { check, integer, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const RESOURCE_NAME_MAX_LENGTH = 100;

export const resourceTypeEnum = pgEnum("resource_type", ResourceType);

export const resources = pgTable(
  "resources",
  {
    contentVersion: integer().notNull().default(0),
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    publishedAt: timestamp(),
    publishVersion: integer().notNull().default(0),
    type: resourceTypeEnum().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name }) => [
      check("resources_name_length_check", createNameCheckSql(name, RESOURCE_NAME_MAX_LENGTH)),
    ],
  },
);

export type Resource = typeof resources.$inferSelect;

export const selectResourceSchema = createSelectSchema(resources, {
  name: (schema) => createNameSchema(RESOURCE_NAME_MAX_LENGTH, schema),
});
