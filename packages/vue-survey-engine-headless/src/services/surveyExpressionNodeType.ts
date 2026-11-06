import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

import { surveyExpressionNodePropsSchema } from "#src/models/SurveyExpressionNodeProps";
import { SurveyNodeType } from "#src/models/SurveyNodeType";

// A calculated value. Its form and its props share one schema, since every prop is one its owner edits, and its defaults are the schema's own
export const surveyExpressionNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyExpressionNode>["createDefaultProps"];
  formSchema: typeof surveyExpressionNodePropsSchema;
  label: string;
  propsSchema: typeof surveyExpressionNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyExpressionNode>["slots"];
  type: SurveyNodeType.Expression;
} = {
  createDefaultProps: () => surveyExpressionNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyExpressionNodePropsSchema,
  label: "Calculated value",
  propsSchema: surveyExpressionNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Expression,
} satisfies SurveyNodeTypeDefinition<SurveyExpressionNode>;
