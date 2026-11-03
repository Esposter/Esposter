import type { SurveyDocument, SurveyPageNode } from "survey-engine";

import { surveyRootPropsSchema } from "survey-engine";
import { describe } from "vitest";

export const createSurveyTestDocument = (pages: SurveyPageNode[]): SurveyDocument => ({
  content: pages,
  root: { props: surveyRootPropsSchema.parse({}) },
});

describe.todo("createSurveyTestDocument");
