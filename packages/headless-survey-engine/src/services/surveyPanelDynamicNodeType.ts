import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";
import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyPanelDynamicNodePropsSchema } from "#src/models/SurveyPanelDynamicNodeProps";
import { SURVEY_TEMPLATE_NODE_TYPES } from "#src/services/surveyNodeTypeLists";

// A dynamic panel question, whose template of questions is drawn once for each panel a respondent adds. Its form and its props share one schema
export const surveyPanelDynamicNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyPanelDynamicNode>["createDefaultProps"];
  formSchema: typeof surveyPanelDynamicNodePropsSchema;
  label: string;
  propsSchema: typeof surveyPanelDynamicNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyPanelDynamicNode>["slots"];
  type: SurveyNodeType.PanelDynamic;
} = {
  createDefaultProps: () => surveyPanelDynamicNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyPanelDynamicNodePropsSchema,
  label: "Dynamic panel",
  propsSchema: surveyPanelDynamicNodePropsSchema,
  slots: { template: SURVEY_TEMPLATE_NODE_TYPES },
  type: SurveyNodeType.PanelDynamic,
} satisfies SurveyNodeTypeDefinition<SurveyPanelDynamicNode>;
