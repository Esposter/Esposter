import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { sqliteTable } from "#src/sqliteTable";
import { index, integer, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

// One respondent's answers to a survey. A draft is kept while they are still answering and reads as submitted once
// they submit. The answers stay one JSON document, since no query reads inside them
export const surveyResponsesInResource = sqliteTable(
  "surveyResponses",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // Set while the respondent is still answering, and cleared once they submit
    isDraft: integer({ mode: "boolean" }).notNull().default(false),
    model: text({ mode: "json" }).notNull().default({}).$type<Record<string, unknown>>(),
    modelVersion: integer().notNull().default(0),
    // Resume position, tracked apart from `model` so a question named "pageNo" can never collide with it. 0 means the
    // respondent never advanced past the first page
    pageNo: integer().notNull().default(0),
    // The program participant token an Identified response was given under, "" in Anonymous mode. A credential, not a
    // row id: "" names no participant, and the token is checked against its program when the response is written
    participantToken: text().notNull().default(""),
    resourceId: text()
      .notNull()
      .references(() => resourcesInResource.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ createdAt, id, isDraft, resourceId }) => [
      // A survey's submitted responses are counted and listed oldest-first under its id, and its deletion cascades through it
      index("surveyResponses_resourceId_isDraft_createdAt_id_index").on(resourceId, isDraft, createdAt, id),
    ],
    schema: resourceSchema,
  },
);

export type SurveyResponseInResource = typeof surveyResponsesInResource.$inferSelect;

export const selectSurveyResponseInResourceSchema = createSelectSchema(surveyResponsesInResource, {
  id: () => z.uuidv4(),
  resourceId: () => z.uuidv4(),
});
