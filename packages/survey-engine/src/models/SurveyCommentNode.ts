import type { SurveyCommentNodeProps } from "#src/models/SurveyCommentNodeProps";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { BlockNode } from "headless-block-editor";

// A comment question node: the comment kind's props, under its type tag
export type SurveyCommentNode = BlockNode<SurveyNodeType.Comment, SurveyCommentNodeProps>;
