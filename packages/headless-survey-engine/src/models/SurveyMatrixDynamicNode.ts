import type { SurveyMatrixDynamicNodeProps } from "#src/models/SurveyMatrixDynamicNodeProps";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// A dynamic matrix question node: the dynamic matrix kind's props, under its type tag
export type SurveyMatrixDynamicNode = BlockNode<SurveyNodeType.MatrixDynamic, SurveyMatrixDynamicNodeProps>;
