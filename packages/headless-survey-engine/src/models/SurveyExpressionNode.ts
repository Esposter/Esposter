import type { SurveyExpressionNodeProps } from "#src/models/SurveyExpressionNodeProps";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// A calculated value node: the expression kind's props, under its type tag
export type SurveyExpressionNode = BlockNode<SurveyNodeType.Expression, SurveyExpressionNodeProps>;
