import type { Database } from "@esposter/db-schema";

import { insertRows } from "#server/services/db/insertRows.test";
import { surveyResponsesInResource } from "@esposter/db-schema";
import { describe } from "vitest";

export const insertSurveyResponses = (db: Database, rows: (typeof surveyResponsesInResource)["$inferInsert"][]) =>
  insertRows(db, surveyResponsesInResource, rows);

describe.todo("insertSurveyResponses");
