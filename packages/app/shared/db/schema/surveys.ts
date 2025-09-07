import { pgTable } from "#shared/db/pgTable";
import { users } from "#shared/db/schema/users";
import { SURVEY_NAME_MAX_LENGTH } from "#shared/services/survey/constants";
import { relations, sql } from "drizzle-orm";
import { check, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const surveys = pgTable(
  "surveys",
  {
    group: text("group"),
    id: uuid("id").primaryKey().defaultRandom(),
    model: text("model").notNull().default(""),
    modelVersion: integer("modelVersion").notNull().default(0),
    name: text("name").notNull(),
    publishedAt: timestamp("publishedAt"),
    publishVersion: integer("publishVersion").notNull().default(0),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  ({ name }) => [
    check("name", sql`LENGTH(${name}) >= 1 AND LENGTH(${name}) <= ${sql.raw(SURVEY_NAME_MAX_LENGTH.toString())}`),
  ],
);

export type Survey = typeof surveys.$inferSelect;

export const selectSurveySchema = createSelectSchema(surveys, {
  name: z.string().min(1).max(SURVEY_NAME_MAX_LENGTH),
});

export const surveysRelations = relations(surveys, ({ one }) => ({
  user: one(users, {
    fields: [surveys.userId],
    references: [users.id],
  }),
}));
