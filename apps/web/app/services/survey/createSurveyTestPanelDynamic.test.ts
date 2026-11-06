import type { SurveyPanelDynamicNode, SurveyTemplateNode } from "vue-survey-engine-headless";

import { describe } from "vitest";
import { SurveyNodeType, surveyNodeTypeDefinitionMap } from "vue-survey-engine-headless";

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
