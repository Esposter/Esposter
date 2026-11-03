import type { SurveyDocument, SurveyPageNode, SurveyPlaceableNode, SurveyTextNode } from "survey-engine";

import { surveyPageNodeType, surveyRootPropsSchema, surveyTextNodeType, SurveyNodeType } from "survey-engine";
import { describe } from "vitest";

// A text question built from its kind's default props, so a fixture holds the shape the schemas parse
export const createSurveyTestQuestion = (
  name: string,
  { isRequired = false, visibleIf = "" }: { isRequired?: boolean; visibleIf?: string } = {},
): SurveyTextNode => ({
  props: { ...surveyTextNodeType.createDefaultProps(), id: crypto.randomUUID(), isRequired, name, visibleIf },
  type: SurveyNodeType.Text,
});

export const createSurveyTestPage = (children: SurveyPlaceableNode[], visibleIf = ""): SurveyPageNode => ({
  props: { ...surveyPageNodeType.createDefaultProps(), children, id: crypto.randomUUID(), visibleIf },
  type: SurveyNodeType.Page,
});

export const createSurveyTestDocument = (pages: SurveyPageNode[]): SurveyDocument => ({
  content: pages,
  root: { props: surveyRootPropsSchema.parse({}) },
});

describe.todo("createSurveyTestDocument");
