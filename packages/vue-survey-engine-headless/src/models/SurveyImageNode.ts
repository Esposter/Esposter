import type { SurveyImageNodeProps } from "#src/models/SurveyImageNodeProps";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// An image node: the image kind's props, under its type tag
export type SurveyImageNode = BlockNode<SurveyNodeType.Image, SurveyImageNodeProps>;
