import type { SurveyNode } from "#src/models/SurveyNode";
import type { BlockChildren } from "vue-block-editor-headless";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { exhaustiveGuard } from "@esposter/shared";
import { NO_BLOCK_SLOTS } from "vue-block-editor-headless";

// The children port of a survey: each node type's slots as the typed list of nodes that slot holds, switched on the type tag
// A node type without a case fails the typecheck at the default, rather than falling through to no slots
export const surveyNodeChildren: BlockChildren<SurveyNode> = (node) => {
  switch (node.type) {
    case SurveyNodeType.Boolean:
    case SurveyNodeType.ButtonGroup:
    case SurveyNodeType.Checkbox:
    case SurveyNodeType.Comment:
    case SurveyNodeType.Dropdown:
    case SurveyNodeType.Expression:
    case SurveyNodeType.Html:
    case SurveyNodeType.Image:
    case SurveyNodeType.ImagePicker:
    case SurveyNodeType.Matrix:
    case SurveyNodeType.MatrixDynamic:
    case SurveyNodeType.MultipleText:
    case SurveyNodeType.RadioGroup:
    case SurveyNodeType.Ranking:
    case SurveyNodeType.Rating:
    case SurveyNodeType.Slider:
    case SurveyNodeType.TagBox:
    case SurveyNodeType.Text:
      return NO_BLOCK_SLOTS;
    case SurveyNodeType.Page:
    case SurveyNodeType.Panel:
      return { children: node.props.children };
    case SurveyNodeType.PanelDynamic:
      return { template: node.props.template };
    default:
      return exhaustiveGuard(node);
  }
};
