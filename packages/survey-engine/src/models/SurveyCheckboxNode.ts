import type { SurveyCheckboxNodeProps } from "#src/models/SurveyCheckboxNodeProps";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { BlockNode } from "headless-block-editor";

// A checkboxes node: the checkbox kind's props, under its type tag
export type SurveyCheckboxNode = BlockNode<SurveyNodeType.Checkbox, SurveyCheckboxNodeProps>;
