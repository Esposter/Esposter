import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";
import type { SurveyTextNode } from "#src/models/SurveyTextNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyTextNodePropsSchema } from "#src/models/SurveyTextNodeProps";

// A text question. Its form and its props share one schema, since every prop is one its owner edits, and its defaults are the schema's own
export const surveyTextNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyTextNode>["createDefaultProps"];
  formSchema: typeof surveyTextNodePropsSchema;
  label: string;
  propsSchema: typeof surveyTextNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyTextNode>["slots"];
  type: SurveyNodeType.Text;
} = {
  createDefaultProps: () => surveyTextNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyTextNodePropsSchema,
  label: "Text",
  propsSchema: surveyTextNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Text,
} satisfies SurveyNodeTypeDefinition<SurveyTextNode>;
