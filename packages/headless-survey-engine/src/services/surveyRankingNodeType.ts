import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";
import type { SurveyRankingNode } from "#src/models/SurveyRankingNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyRankingNodePropsSchema } from "#src/models/SurveyRankingNodeProps";

// A ranking question. Its form and its props share one schema, since every prop is one its owner edits, and its defaults are the schema's own
// The type is written out so the schema's shape survives into the emitted declaration
export const surveyRankingNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyRankingNode>["createDefaultProps"];
  formSchema: typeof surveyRankingNodePropsSchema;
  label: string;
  propsSchema: typeof surveyRankingNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyRankingNode>["slots"];
  type: SurveyNodeType.Ranking;
} = {
  createDefaultProps: () => surveyRankingNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyRankingNodePropsSchema,
  label: "Ranking",
  propsSchema: surveyRankingNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Ranking,
} satisfies SurveyNodeTypeDefinition<SurveyRankingNode>;
