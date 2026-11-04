import type { SurveyDropdownNodeProps } from "#src/models/SurveyDropdownNodeProps";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { BlockNode } from "headless-block-editor";

// A dropdown node: the dropdown kind's props, under its type tag
export type SurveyDropdownNode = BlockNode<SurveyNodeType.Dropdown, SurveyDropdownNodeProps>;
