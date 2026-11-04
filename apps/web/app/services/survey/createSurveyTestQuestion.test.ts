import type { SurveyTextNode } from "headless-survey-engine";

import { SurveyNodeType, surveyTextNodeType } from "headless-survey-engine";
import { describe } from "vitest";

// A text question built from its kind's default props, so a fixture holds the shape the schemas parse
export const createSurveyTestQuestion = (
  name: string,
  {
    enableIf = "",
    isRequired = false,
    requiredIf = "",
    visibleIf = "",
  }: { enableIf?: string; isRequired?: boolean; requiredIf?: string; visibleIf?: string } = {},
): SurveyTextNode => ({
  props: {
    ...surveyTextNodeType.createDefaultProps(),
    enableIf,
    id: crypto.randomUUID(),
    isRequired,
    name,
    requiredIf,
    visibleIf,
  },
  type: SurveyNodeType.Text,
});

describe.todo("createSurveyTestQuestion");
