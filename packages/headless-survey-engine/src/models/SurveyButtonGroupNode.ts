import type { SurveyButtonGroupNodeProps } from "#src/models/SurveyButtonGroupNodeProps";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// A button group node: the button group kind's props, under its type tag
export type SurveyButtonGroupNode = BlockNode<SurveyNodeType.ButtonGroup, SurveyButtonGroupNodeProps>;
