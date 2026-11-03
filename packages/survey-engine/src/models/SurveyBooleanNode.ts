import type { SurveyBooleanNodeProps } from "#src/models/SurveyBooleanNodeProps";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { BlockNode } from "headless-block-editor";

// A yes or no question node: the boolean kind's props, under its type tag
export type SurveyBooleanNode = BlockNode<SurveyNodeType.Boolean, SurveyBooleanNodeProps>;
