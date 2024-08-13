import { users } from "@/db/schema/users";
import { pgTable } from "@/db/shared/pgTable";
import { SURVEY_NAME_MAX_LENGTH } from "@/services/surveyer/constants";
import { relations } from "drizzle-orm";
import { integer, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const surveys = pgTable("Survey", {
  creatorId: uuid("creatorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  group: text("group"),
  id: uuid("id").primaryKey().defaultRandom(),
  model: text("model").notNull().default(""),
  modelVersion: integer("modelVersion").notNull().default(0),
  name: text("name").notNull(),
  publishedAt: timestamp("publishedAt", { mode: "date" }),
  publishVersion: integer("publishVersion").notNull().default(0),
});

export type Survey = typeof surveys.$inferSelect;

export const selectSurveySchema = createSelectSchema(surveys, {
  name: z.string().min(1).max(SURVEY_NAME_MAX_LENGTH),
});

export const surveysRelations = relations(surveys, ({ one }) => ({
  creator: one(users, {
    fields: [surveys.creatorId],
    references: [users.id],
  }),
}));
