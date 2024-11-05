import { users } from "@/server/db/schema/users";
import { pgTable } from "@/server/db/shared/pgTable";
import { SURVEY_NAME_MAX_LENGTH } from "@/services/surveyer/constants";
import { relations } from "drizzle-orm";
import { integer, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const surveys = pgTable("Survey", {
  group: text("group"),
  id: uuid("id").primaryKey().defaultRandom(),
  model: text("model").notNull().default(""),
  modelVersion: integer("modelVersion").notNull().default(0),
  name: text("name").notNull(),
  publishedAt: timestamp("publishedAt", { mode: "date" }),
  publishVersion: integer("publishVersion").notNull().default(0),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

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
