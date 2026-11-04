import type { SurveyMultipleTextNode } from "#src/models/SurveyMultipleTextNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

import { surveyMultipleTextNodePropsSchema } from "#src/models/SurveyMultipleTextNodeProps";
import { SurveyNodeType } from "#src/models/SurveyNodeType";

// A multiple text question. Its form and its props share one schema, since every prop is one its owner edits, and its defaults are the schema's own
// The type is written out so the schema's shape survives into the emitted declaration
export const surveyMultipleTextNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyMultipleTextNode>["createDefaultProps"];
  formSchema: typeof surveyMultipleTextNodePropsSchema;
  label: string;
  propsSchema: typeof surveyMultipleTextNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyMultipleTextNode>["slots"];
  type: SurveyNodeType.MultipleText;
} = {
  createDefaultProps: () => surveyMultipleTextNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyMultipleTextNodePropsSchema,
  label: "Multiple text",
  propsSchema: surveyMultipleTextNodePropsSchema,
  slots: {},
  type: SurveyNodeType.MultipleText,
} satisfies SurveyNodeTypeDefinition<SurveyMultipleTextNode>;
