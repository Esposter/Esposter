import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";
import type { SurveyRatingNode } from "#src/models/SurveyRatingNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyRatingNodePropsSchema } from "#src/models/SurveyRatingNodeProps";

// A rating question. Its form and its props share one schema, since every prop is one its owner edits, and its defaults are the schema's own
export const surveyRatingNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyRatingNode>["createDefaultProps"];
  formSchema: typeof surveyRatingNodePropsSchema;
  label: string;
  propsSchema: typeof surveyRatingNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyRatingNode>["slots"];
  type: SurveyNodeType.Rating;
} = {
  createDefaultProps: () => surveyRatingNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyRatingNodePropsSchema,
  label: "Rating",
  propsSchema: surveyRatingNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Rating,
} satisfies SurveyNodeTypeDefinition<SurveyRatingNode>;
