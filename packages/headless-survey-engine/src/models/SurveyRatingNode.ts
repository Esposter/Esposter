import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { SurveyRatingNodeProps } from "#src/models/SurveyRatingNodeProps";
import type { BlockNode } from "vue-block-editor-headless";

// A rating question node: the rating kind's props, under its type tag
export type SurveyRatingNode = BlockNode<SurveyNodeType.Rating, SurveyRatingNodeProps>;
