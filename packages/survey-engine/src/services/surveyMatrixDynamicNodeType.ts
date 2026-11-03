import type { SurveyMatrixDynamicNode } from "#src/models/SurveyMatrixDynamicNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

import { surveyMatrixDynamicNodePropsSchema } from "#src/models/SurveyMatrixDynamicNodeProps";
import { SurveyNodeType } from "#src/models/SurveyNodeType";

// A dynamic matrix question. Its form and its props share one schema, since every prop is one its owner edits, and its defaults are the schema's own
// The type is written out so the schema's shape survives into the emitted declaration
export const surveyMatrixDynamicNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyMatrixDynamicNode>["createDefaultProps"];
  formSchema: typeof surveyMatrixDynamicNodePropsSchema;
  label: string;
  propsSchema: typeof surveyMatrixDynamicNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyMatrixDynamicNode>["slots"];
  type: SurveyNodeType.MatrixDynamic;
} = {
  createDefaultProps: () => surveyMatrixDynamicNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyMatrixDynamicNodePropsSchema,
  label: "Dynamic matrix",
  propsSchema: surveyMatrixDynamicNodePropsSchema,
  slots: {},
  type: SurveyNodeType.MatrixDynamic,
} satisfies SurveyNodeTypeDefinition<SurveyMatrixDynamicNode>;
