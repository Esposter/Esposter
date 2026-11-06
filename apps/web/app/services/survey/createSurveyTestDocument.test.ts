import type { SurveyDocument, SurveyPageNode } from "vue-survey-engine-headless";

import { describe } from "vitest";
import { surveyRootPropsSchema } from "vue-survey-engine-headless";

export const createSurveyTestDocument = (pages: SurveyPageNode[]): SurveyDocument => ({
  content: pages,
  root: { props: surveyRootPropsSchema.parse({}) },
});

describe.todo("createSurveyTestDocument");
