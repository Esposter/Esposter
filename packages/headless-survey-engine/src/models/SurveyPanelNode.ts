import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { SurveyPanelNodeProps } from "#src/models/SurveyPanelNodeProps";
import type { BlockNode } from "headless-block-editor";

// A panel node: the panel kind's props, under its type tag
export type SurveyPanelNode = BlockNode<SurveyNodeType.Panel, SurveyPanelNodeProps>;
