import type { SurveyPanelDynamicNode, SurveyTemplateNode } from "headless-survey-engine";

import { SurveyNodeType, surveyNodeTypeDefinitionMap } from "headless-survey-engine";
import { describe } from "vitest";

// A dynamic panel built from its kind's default props, holding the template each of its repeats is made from
export const createSurveyTestPanelDynamic = (name: string, template: SurveyTemplateNode[]): SurveyPanelDynamicNode => ({
  props: {
    ...surveyNodeTypeDefinitionMap[SurveyNodeType.PanelDynamic].createDefaultProps(),
    id: crypto.randomUUID(),
    name,
    template,
  },
  type: SurveyNodeType.PanelDynamic,
});

describe.todo("createSurveyTestPanelDynamic");
