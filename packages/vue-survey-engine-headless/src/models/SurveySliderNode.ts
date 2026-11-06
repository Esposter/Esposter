import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { SurveySliderNodeProps } from "#src/models/SurveySliderNodeProps";
import type { BlockNode } from "vue-block-editor-headless";

// A slider question node: the slider kind's props, under its type tag
export type SurveySliderNode = BlockNode<SurveyNodeType.Slider, SurveySliderNodeProps>;
