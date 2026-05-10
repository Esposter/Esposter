import { createNameCheckSql, createNameSchema, createNormalizedStringSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const SURVEY_NAME_MAX_LENGTH = 100;
export const SURVEY_GROUP_MAX_LENGTH = 100;

export const surveys = pgTable(
  "surveys",
  {
    group: text().notNull().default(""),
    id: uuid().primaryKey().defaultRandom(),
    model: text().notNull().default(""),
    modelVersion: integer().notNull().default(0),
    name: text().notNull(),
    publishedAt: timestamp(),
    publishVersion: integer().notNull().default(0),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ group, name }) => [
      check("surveys_name_length_check", createNameCheckSql(name, SURVEY_NAME_MAX_LENGTH)),
      check("surveys_group_length_check", sql`LENGTH(${group}) <= ${sql.raw(SURVEY_GROUP_MAX_LENGTH.toString())}`),
    ],
  },
);

export type Survey = typeof surveys.$inferSelect;

export const selectSurveySchema = createSelectSchema(surveys, {
  group: (schema) => createNormalizedStringSchema(SURVEY_GROUP_MAX_LENGTH, schema),
  name: (schema) => createNameSchema(SURVEY_NAME_MAX_LENGTH, schema),
});
