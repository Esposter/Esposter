import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";
import type { SurveyPanelNode } from "#src/models/SurveyPanelNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyPanelNodePropsSchema } from "#src/models/SurveyPanelNodeProps";
import { SURVEY_PLACEABLE_NODE_TYPES } from "#src/services/surveyNodeTypeLists";

// A panel, which groups questions and panels under a heading. Its form and its props share one schema, and its defaults are the schema's own
export const surveyPanelNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyPanelNode>["createDefaultProps"];
  formSchema: typeof surveyPanelNodePropsSchema;
  label: string;
  propsSchema: typeof surveyPanelNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyPanelNode>["slots"];
  type: SurveyNodeType.Panel;
} = {
  createDefaultProps: () => surveyPanelNodePropsSchema.parse({}),
  formSchema: surveyPanelNodePropsSchema,
  label: "Panel",
  propsSchema: surveyPanelNodePropsSchema,
  slots: { children: SURVEY_PLACEABLE_NODE_TYPES },
  type: SurveyNodeType.Panel,
} satisfies SurveyNodeTypeDefinition<SurveyPanelNode>;
