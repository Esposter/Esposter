import type { SurveyMatrixNodeProps } from "#src/models/SurveyMatrixNodeProps";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// A matrix question node: the matrix kind's props, under its type tag
export type SurveyMatrixNode = BlockNode<SurveyNodeType.Matrix, SurveyMatrixNodeProps>;
