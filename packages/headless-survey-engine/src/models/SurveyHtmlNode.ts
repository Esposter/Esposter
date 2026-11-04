import type { SurveyHtmlNodeProps } from "#src/models/SurveyHtmlNodeProps";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { BlockNode } from "headless-block-editor";

// A text block node: the html kind's props, under its type tag
export type SurveyHtmlNode = BlockNode<SurveyNodeType.Html, SurveyHtmlNodeProps>;
