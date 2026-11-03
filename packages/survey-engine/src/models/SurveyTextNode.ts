import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { SurveyTextNodeProps } from "#src/models/SurveyTextNodeProps";
import type { BlockNode } from "headless-block-editor";

// A text question node: the text kind's props, under its type tag
export type SurveyTextNode = BlockNode<SurveyNodeType.Text, SurveyTextNodeProps>;
