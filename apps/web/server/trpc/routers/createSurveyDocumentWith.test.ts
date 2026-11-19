import type { SurveyDocument, SurveyNodeType } from "vue-survey-engine-headless";

import { createPageDocument } from "#server/trpc/routers/createPageDocument.test";
import { v7 } from "uuid";
import { describe } from "vitest";

// A survey document whose one page holds a question of each given name and kind. Each question takes its kind's
// Defaults and a fresh id the document requires to be unique
export const createSurveyDocumentWith = (questions: { name: string; type: SurveyNodeType }[]): SurveyDocument =>
  createPageDocument(questions.map(({ name, type }) => ({ props: { id: v7(), name }, type })));

describe.todo("createSurveyDocumentWith");
