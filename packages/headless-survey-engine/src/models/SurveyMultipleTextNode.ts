import type { SurveyMultipleTextNodeProps } from "#src/models/SurveyMultipleTextNodeProps";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { BlockNode } from "headless-block-editor";

// A multiple text question node: the multiple text kind's props, under its type tag
export type SurveyMultipleTextNode = BlockNode<SurveyNodeType.MultipleText, SurveyMultipleTextNodeProps>;
