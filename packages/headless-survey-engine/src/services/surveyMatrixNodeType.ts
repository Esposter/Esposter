import type { SurveyMatrixNode } from "#src/models/SurveyMatrixNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

import { surveyMatrixNodePropsSchema } from "#src/models/SurveyMatrixNodeProps";
import { SurveyNodeType } from "#src/models/SurveyNodeType";

// A matrix question. Its form and its props share one schema, since every prop is one its owner edits, and its defaults are the schema's own
export const surveyMatrixNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyMatrixNode>["createDefaultProps"];
  formSchema: typeof surveyMatrixNodePropsSchema;
  label: string;
  propsSchema: typeof surveyMatrixNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyMatrixNode>["slots"];
  type: SurveyNodeType.Matrix;
} = {
  createDefaultProps: () => surveyMatrixNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyMatrixNodePropsSchema,
  label: "Matrix",
  propsSchema: surveyMatrixNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Matrix,
} satisfies SurveyNodeTypeDefinition<SurveyMatrixNode>;
