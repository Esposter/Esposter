import type { SurveyNode } from "#src/models/SurveyNode";
import type { BlockChildren } from "headless-block-editor";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { exhaustiveGuard } from "@esposter/shared";

// The children port of a survey: each node type's slots as the typed list of nodes that slot holds, switched on the type tag
// A node with no slot holds no children, typed as the port's own record so the switch's return unions stay assignable to it
const NO_SLOTS: Readonly<Record<string, readonly SurveyNode[]>> = {};

export const surveyNodeChildren: BlockChildren<SurveyNode> = (node) => {
  switch (node.type) {
    case SurveyNodeType.Text:
    case SurveyNodeType.Comment:
    case SurveyNodeType.Boolean:
    case SurveyNodeType.RadioGroup:
    case SurveyNodeType.Dropdown:
    case SurveyNodeType.Checkbox:
    case SurveyNodeType.TagBox:
    case SurveyNodeType.Rating:
    case SurveyNodeType.Ranking:
    case SurveyNodeType.Matrix:
    case SurveyNodeType.MatrixDynamic:
    case SurveyNodeType.MultipleText:
    case SurveyNodeType.Slider:
    case SurveyNodeType.ButtonGroup:
    case SurveyNodeType.ImagePicker:
    case SurveyNodeType.Expression:
    case SurveyNodeType.Html:
    case SurveyNodeType.Image:
      return NO_SLOTS;
    case SurveyNodeType.Page:
    case SurveyNodeType.Panel:
      return { children: node.props.children };
    case SurveyNodeType.PanelDynamic:
      return { template: node.props.template };
    default:
      return exhaustiveGuard(node);
  }
};
