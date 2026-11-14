import type { SurveyPageNode, SurveyPlaceableNode } from "vue-survey-engine-headless";

import { v7 } from "uuid";
import { describe } from "vitest";
import { SurveyNodeType, surveyPageNodeType } from "vue-survey-engine-headless";

export const createSurveyTestPage = (children: SurveyPlaceableNode[], visibleIf = ""): SurveyPageNode => ({
  props: { ...surveyPageNodeType.createDefaultProps(), children, id: v7(), visibleIf },
  type: SurveyNodeType.Page,
});

describe.todo("createSurveyTestPage");
