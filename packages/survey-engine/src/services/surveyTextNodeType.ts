import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";
import type { SurveyTextNode } from "#src/models/SurveyTextNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { SurveyTextInputType } from "#src/models/SurveyTextInputType";
import { surveyTextNodePropsSchema } from "#src/models/SurveyTextNodeProps";

// A text question. Its form and its props share one schema, since every prop is one its owner edits.
// A webpage's text node holds a style its form does not edit, so its form and its props differ.
// The schema's own type is written out so its shape survives into the emitted declaration.
export const surveyTextNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyTextNode>["createDefaultProps"];
  formSchema: typeof surveyTextNodePropsSchema;
  label: string;
  propsSchema: typeof surveyTextNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyTextNode>["slots"];
  type: SurveyNodeType.Text;
} = {
  createDefaultProps: () => ({
    inputType: SurveyTextInputType.Text,
    isRequired: false,
    name: "question",
    validators: [],
  }),
  formSchema: surveyTextNodePropsSchema,
  label: "Text",
  propsSchema: surveyTextNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Text,
} satisfies SurveyNodeTypeDefinition<SurveyTextNode>;
