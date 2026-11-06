import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";
import type { SurveyPageNode } from "#src/models/SurveyPageNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyPageNodePropsSchema } from "#src/models/SurveyPageNodeProps";
import { SURVEY_PLACEABLE_NODE_TYPES } from "#src/services/surveyNodeTypeLists";

// A page, which holds the survey's questions and panels. Its form and its props share one schema, and its defaults are the schema's own
export const surveyPageNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyPageNode>["createDefaultProps"];
  formSchema: typeof surveyPageNodePropsSchema;
  label: string;
  propsSchema: typeof surveyPageNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyPageNode>["slots"];
  type: SurveyNodeType.Page;
} = {
  createDefaultProps: () => surveyPageNodePropsSchema.parse({}),
  formSchema: surveyPageNodePropsSchema,
  label: "Page",
  propsSchema: surveyPageNodePropsSchema,
  slots: { children: SURVEY_PLACEABLE_NODE_TYPES },
  type: SurveyNodeType.Page,
} satisfies SurveyNodeTypeDefinition<SurveyPageNode>;
