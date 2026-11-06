import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { SurveyPageNodeProps } from "#src/models/SurveyPageNodeProps";
import type { BlockNode } from "vue-block-editor-headless";

// A page node: the page kind's props, under its type tag
export type SurveyPageNode = BlockNode<SurveyNodeType.Page, SurveyPageNodeProps>;
