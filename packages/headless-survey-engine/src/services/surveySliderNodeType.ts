import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";
import type { SurveySliderNode } from "#src/models/SurveySliderNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveySliderNodePropsSchema } from "#src/models/SurveySliderNodeProps";

// A slider question. Its form and its props share one schema, since every prop is one its owner edits, and its defaults are the schema's own
// The type is written out so the schema's shape survives into the emitted declaration
export const surveySliderNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveySliderNode>["createDefaultProps"];
  formSchema: typeof surveySliderNodePropsSchema;
  label: string;
  propsSchema: typeof surveySliderNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveySliderNode>["slots"];
  type: SurveyNodeType.Slider;
} = {
  createDefaultProps: () => surveySliderNodePropsSchema.parse({ name: "question" }),
  formSchema: surveySliderNodePropsSchema,
  label: "Slider",
  propsSchema: surveySliderNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Slider,
} satisfies SurveyNodeTypeDefinition<SurveySliderNode>;
