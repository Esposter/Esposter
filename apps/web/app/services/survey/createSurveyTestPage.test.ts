import type { SurveyPageNode, SurveyPlaceableNode } from "vue-survey-engine-headless";

import { describe } from "vitest";
import { SurveyNodeType, surveyPageNodeType } from "vue-survey-engine-headless";

export const createSurveyTestPage = (children: SurveyPlaceableNode[], visibleIf = ""): SurveyPageNode => ({
  props: { ...surveyPageNodeType.createDefaultProps(), children, id: crypto.randomUUID(), visibleIf },
  type: SurveyNodeType.Page,
});

describe.todo("createSurveyTestPage");
