import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { relations } from "drizzle-orm";
import { check, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const SURVEY_NAME_MAX_LENGTH = 100;

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
  {
    extraConfig: ({ name }) => [check("name", createNameCheckSql(name, SURVEY_NAME_MAX_LENGTH))],
  },
);

export type Survey = typeof surveys.$inferSelect;

export const selectSurveySchema = createSelectSchema(surveys, {
  name: createNameSchema(SURVEY_NAME_MAX_LENGTH),
});

export const surveysRelations = relations(surveys, ({ one }) => ({
  user: one(users, {
    fields: [surveys.userId],
    references: [users.id],
  }),
}));
