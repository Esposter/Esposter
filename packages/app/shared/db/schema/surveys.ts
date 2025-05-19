import { pgTable } from "#shared/db/pgTable";
import { users } from "#shared/db/schema/users";
import { fileEntitySchema } from "#shared/models/azure/FileEntity";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { SURVEY_NAME_MAX_LENGTH } from "#shared/services/surveyer/constants";
import { relations, sql } from "drizzle-orm";
import { check, integer, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const surveys = pgTable(
  "surveys",
  {
    fileIds: jsonb("fileIds").$type<string[]>().default([]),
    group: text("group"),
    id: uuid("id").primaryKey().defaultRandom(),
    model: text("model").notNull().default(""),
    modelVersion: integer("modelVersion").notNull().default(0),
    name: text("name").notNull(),
    publishedAt: timestamp("publishedAt", { mode: "date" }),
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
  fileIds: fileEntitySchema.shape.id.array().max(MAX_READ_LIMIT),
  name: z.string().min(1).max(SURVEY_NAME_MAX_LENGTH),
});

export const surveysRelations = relations(surveys, ({ one }) => ({
  user: one(users, {
    fields: [surveys.userId],
    references: [users.id],
  }),
}));
