import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { SurveyTagBoxNodeProps } from "#src/models/SurveyTagBoxNodeProps";
import type { BlockNode } from "headless-block-editor";

// A tag box node: the tag box kind's props, under its type tag
export type SurveyTagBoxNode = BlockNode<SurveyNodeType.TagBox, SurveyTagBoxNodeProps>;
