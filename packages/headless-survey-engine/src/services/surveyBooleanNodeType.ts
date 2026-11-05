import type { SurveyBooleanNode } from "#src/models/SurveyBooleanNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

import { surveyBooleanNodePropsSchema } from "#src/models/SurveyBooleanNodeProps";
import { SurveyNodeType } from "#src/models/SurveyNodeType";

// A yes or no question, whose form and props are one schema and whose defaults are that schema's own
export const surveyBooleanNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyBooleanNode>["createDefaultProps"];
  formSchema: typeof surveyBooleanNodePropsSchema;
  label: string;
  propsSchema: typeof surveyBooleanNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyBooleanNode>["slots"];
  type: SurveyNodeType.Boolean;
} = {
  createDefaultProps: () => surveyBooleanNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyBooleanNodePropsSchema,
  label: "Yes or no",
  propsSchema: surveyBooleanNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Boolean,
} satisfies SurveyNodeTypeDefinition<SurveyBooleanNode>;
