import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { SurveyRadioGroupNodeProps } from "#src/models/SurveyRadioGroupNodeProps";
import type { BlockNode } from "vue-block-editor-headless";

// A radio group node: the radio group kind's props, under its type tag
export type SurveyRadioGroupNode = BlockNode<SurveyNodeType.RadioGroup, SurveyRadioGroupNodeProps>;
