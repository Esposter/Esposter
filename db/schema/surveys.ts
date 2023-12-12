import { users } from "@/db/schema/users";
import { pgTable } from "@/db/shared/pgTable";
import { relations } from "drizzle-orm";
import { integer, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const surveys = pgTable("Survey", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creatorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull().default(""),
  group: text("group"),
  model: text("model").notNull().default(""),
  modelVersion: integer("modelVersion").notNull().default(0),
  publishVersion: integer("publishVersion").notNull().default(0),
  publishedAt: timestamp("publishedAt", { mode: "date" }),
});

export type Survey = typeof surveys.$inferSelect;

export const selectSurveySchema = createSelectSchema(surveys);

export const surveysRelations = relations(surveys, ({ one }) => ({
  creator: one(users, {
    fields: [surveys.creatorId],
    references: [users.id],
  }),
}));
