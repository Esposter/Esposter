import type { SurveyNode } from "#src/models/SurveyNode";
import type { BlockChildren } from "headless-block-editor";

import { SurveyNodeType } from "#src/models/SurveyNodeType";

// The children port of a survey: each node type's slots as the typed list of nodes that slot holds, keyed by the type tag
// A node with no slot holds no children, typed as the port's own record so each entry's return stays assignable to it
const NO_SLOTS: Readonly<Record<string, readonly SurveyNode[]>> = {};

// Keyed by every node type, so a new type without an entry fails the satisfies check rather than falling through to no slots
const SURVEY_NODE_CHILDREN_MAP = {
  [SurveyNodeType.Boolean]: () => NO_SLOTS,
  [SurveyNodeType.ButtonGroup]: () => NO_SLOTS,
  [SurveyNodeType.Checkbox]: () => NO_SLOTS,
  [SurveyNodeType.Comment]: () => NO_SLOTS,
  [SurveyNodeType.Dropdown]: () => NO_SLOTS,
  [SurveyNodeType.Expression]: () => NO_SLOTS,
  [SurveyNodeType.Html]: () => NO_SLOTS,
  [SurveyNodeType.Image]: () => NO_SLOTS,
  [SurveyNodeType.ImagePicker]: () => NO_SLOTS,
  [SurveyNodeType.Matrix]: () => NO_SLOTS,
  [SurveyNodeType.MatrixDynamic]: () => NO_SLOTS,
  [SurveyNodeType.MultipleText]: () => NO_SLOTS,
  [SurveyNodeType.Page]: (node) => ({ children: node.props.children }),
  [SurveyNodeType.Panel]: (node) => ({ children: node.props.children }),
  [SurveyNodeType.PanelDynamic]: (node) => ({ template: node.props.template }),
  [SurveyNodeType.RadioGroup]: () => NO_SLOTS,
  [SurveyNodeType.Ranking]: () => NO_SLOTS,
  [SurveyNodeType.Rating]: () => NO_SLOTS,
  [SurveyNodeType.Slider]: () => NO_SLOTS,
  [SurveyNodeType.TagBox]: () => NO_SLOTS,
  [SurveyNodeType.Text]: () => NO_SLOTS,
} as const satisfies {
  [Type in SurveyNodeType]: (
    node: Extract<SurveyNode, { type: Type }>,
  ) => Readonly<Record<string, readonly SurveyNode[]>>;
};

export const surveyNodeChildren: BlockChildren<SurveyNode> = (node) =>
  SURVEY_NODE_CHILDREN_MAP[node.type](node as never);
