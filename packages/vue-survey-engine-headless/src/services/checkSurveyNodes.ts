import type { SurveyDocumentIssue } from "#src/models/SurveyDocumentIssue";
import type { SurveyNode } from "#src/models/SurveyNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { checkSurveyMinimumWithinMaximum } from "#src/services/checkSurveyMinimumWithinMaximum";
import { checkSurveyNoneChoice } from "#src/services/checkSurveyNoneChoice";
import { checkSurveyOptionalExpression } from "#src/services/checkSurveyOptionalExpression";
import { checkSurveyQuestion } from "#src/services/checkSurveyQuestion";
import { getBlockPropPointer } from "vue-block-editor-headless";

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
    if (node.type === SurveyNodeType.Checkbox)
      checkSurveyMinimumWithinMaximum(
        node.props.minSelected,
        node.props.maxSelected,
        getBlockPropPointer(nodePointer, "minSelected"),
        issues,
      );
    if (node.type === SurveyNodeType.MatrixDynamic)
      checkSurveyMinimumWithinMaximum(
        node.props.minRowCount,
        node.props.maxRowCount,
        getBlockPropPointer(nodePointer, "minRowCount"),
        issues,
      );
    switch (node.type) {
      case SurveyNodeType.Expression:
        checkSurveyQuestion(node.props, nodePointer, names, issues);
        checkSurveyOptionalExpression(
          node.props.expression,
          "expression",
          getBlockPropPointer(nodePointer, "expression"),
          issues,
        );
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
      case SurveyNodeType.PanelDynamic:
        checkSurveyQuestion(node.props, nodePointer, names, issues);
        checkSurveyNodes(node.props.template, getBlockPropPointer(nodePointer, "template"), new Set<string>(), issues);
        break;
      // Every other kind is a question, narrowed by the cases above, so a kind whose props are not a question's fails the typecheck here
      default:
        checkSurveyQuestion(node.props, nodePointer, names, issues);
    }
  }
};
