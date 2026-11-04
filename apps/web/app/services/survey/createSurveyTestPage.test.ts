import type { SurveyPageNode, SurveyPlaceableNode } from "survey-engine";

import { SurveyNodeType, surveyPageNodeType } from "survey-engine";
import { describe } from "vitest";

export const createSurveyTestPage = (children: SurveyPlaceableNode[], visibleIf = ""): SurveyPageNode => ({
  props: { ...surveyPageNodeType.createDefaultProps(), children, id: crypto.randomUUID(), visibleIf },
  type: SurveyNodeType.Page,
});

describe.todo("createSurveyTestPage");
