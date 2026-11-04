import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { SurveyPanelDynamicNodeProps } from "#src/models/SurveyPanelDynamicNodeProps";
import type { BlockNode } from "headless-block-editor";

// A dynamic panel question node: the dynamic panel kind's props, under its type tag
export type SurveyPanelDynamicNode = BlockNode<SurveyNodeType.PanelDynamic, SurveyPanelDynamicNodeProps>;
