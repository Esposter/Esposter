import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { SurveyRankingNodeProps } from "#src/models/SurveyRankingNodeProps";
import type { BlockNode } from "headless-block-editor";

// A ranking question node: the ranking kind's props, under its type tag
export type SurveyRankingNode = BlockNode<SurveyNodeType.Ranking, SurveyRankingNodeProps>;
