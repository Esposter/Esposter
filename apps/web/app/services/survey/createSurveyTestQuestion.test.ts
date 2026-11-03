import type { SurveyTextNode } from "survey-engine";

import { surveyTextNodeType, SurveyNodeType } from "survey-engine";
import { describe } from "vitest";

// A text question built from its kind's default props, so a fixture holds the shape the schemas parse
export const createSurveyTestQuestion = (
  name: string,
  { isRequired = false, visibleIf = "" }: { isRequired?: boolean; visibleIf?: string } = {},
): SurveyTextNode => ({
  props: { ...surveyTextNodeType.createDefaultProps(), id: crypto.randomUUID(), isRequired, name, visibleIf },
  type: SurveyNodeType.Text,
});

describe.todo("createSurveyTestQuestion");
