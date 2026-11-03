import type { SurveyDocumentIssue } from "#src/models/SurveyDocumentIssue";
import type { SurveyNode } from "#src/models/SurveyNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { checkSurveyNoneChoice } from "#src/services/checkSurveyNoneChoice";
import { checkSurveyOptionalExpression } from "#src/services/checkSurveyOptionalExpression";
import { checkSurveyQuestion } from "#src/services/checkSurveyQuestion";
import { exhaustiveGuard } from "@esposter/shared";
import { getBlockPropPointer } from "headless-block-editor";

// Walks a list of nodes in document order. A page's and a panel's nodes share the names of their scope
// A dynamic panel's template is a scope of its own, so its questions are named among themselves and may repeat a name outside the panel
export const checkSurveyNodes = (
  nodes: readonly SurveyNode[],
  listPointer: string,
  names: Set<string>,
  issues: SurveyDocumentIssue[],
): void => {
  for (const [index, node] of nodes.entries()) {
    const nodePointer = `${listPointer}/${index}`;
    if (node.type === SurveyNodeType.RadioGroup || node.type === SurveyNodeType.Checkbox)
      checkSurveyNoneChoice(node.props, nodePointer, issues);
    switch (node.type) {
      case SurveyNodeType.Page:
        checkSurveyOptionalExpression(
          node.props.visibleIf,
          "visibility condition",
          getBlockPropPointer(nodePointer, "visibleIf"),
          issues,
        );
        checkSurveyNodes(node.props.children, getBlockPropPointer(nodePointer, "children"), names, issues);
        break;
      case SurveyNodeType.Panel:
        checkSurveyOptionalExpression(
          node.props.visibleIf,
          "visibility condition",
          getBlockPropPointer(nodePointer, "visibleIf"),
          issues,
        );
        checkSurveyOptionalExpression(
          node.props.enableIf,
          "enable condition",
          getBlockPropPointer(nodePointer, "enableIf"),
          issues,
        );
        checkSurveyNodes(node.props.children, getBlockPropPointer(nodePointer, "children"), names, issues);
        break;
      case SurveyNodeType.Html:
      case SurveyNodeType.Image:
        checkSurveyOptionalExpression(
          node.props.visibleIf,
          "visibility condition",
          getBlockPropPointer(nodePointer, "visibleIf"),
          issues,
        );
        break;
      case SurveyNodeType.PanelDynamic:
        checkSurveyQuestion(node.props, nodePointer, names, issues);
        checkSurveyNodes(node.props.template, getBlockPropPointer(nodePointer, "template"), new Set<string>(), issues);
        break;
      case SurveyNodeType.Expression:
        checkSurveyQuestion(node.props, nodePointer, names, issues);
        checkSurveyOptionalExpression(
          node.props.expression,
          "expression",
          getBlockPropPointer(nodePointer, "expression"),
          issues,
        );
        break;
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
        checkSurveyQuestion(node.props, nodePointer, names, issues);
        break;
      default:
        exhaustiveGuard(node);
    }
  }
};
