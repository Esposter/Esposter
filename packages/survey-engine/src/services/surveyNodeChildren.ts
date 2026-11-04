import type { SurveyNode } from "#src/models/SurveyNode";
import type { BlockChildren } from "headless-block-editor";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { NO_BLOCK_SLOTS } from "headless-block-editor";

// The children port of a survey: each node type's slots as the typed list of nodes that slot holds, keyed by the type tag
// Keyed by every node type, so a new type without an entry fails the satisfies check rather than falling through to no slots
const SURVEY_NODE_CHILDREN_MAP = {
  [SurveyNodeType.Boolean]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.ButtonGroup]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.Checkbox]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.Comment]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.Dropdown]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.Expression]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.Html]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.Image]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.ImagePicker]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.Matrix]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.MatrixDynamic]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.MultipleText]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.Page]: (node) => ({ children: node.props.children }),
  [SurveyNodeType.Panel]: (node) => ({ children: node.props.children }),
  [SurveyNodeType.PanelDynamic]: (node) => ({ template: node.props.template }),
  [SurveyNodeType.RadioGroup]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.Ranking]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.Rating]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.Slider]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.TagBox]: () => NO_BLOCK_SLOTS,
  [SurveyNodeType.Text]: () => NO_BLOCK_SLOTS,
} as const satisfies {
  [Type in SurveyNodeType]: (
    node: Extract<SurveyNode, { type: Type }>,
  ) => Readonly<Record<string, readonly SurveyNode[]>>;
};

export const surveyNodeChildren: BlockChildren<SurveyNode> = (node) =>
  SURVEY_NODE_CHILDREN_MAP[node.type](node as never);
