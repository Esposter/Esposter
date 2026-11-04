import type { SurveyExpressionBinaryNode } from "#src/models/SurveyExpressionBinaryNode";
import type { SurveyExpressionCallNode } from "#src/models/SurveyExpressionCallNode";
import type { SurveyExpressionListNode } from "#src/models/SurveyExpressionListNode";
import type { SurveyExpressionLiteralNode } from "#src/models/SurveyExpressionLiteralNode";
import type { SurveyExpressionReferenceNode } from "#src/models/SurveyExpressionReferenceNode";
import type { SurveyExpressionUnaryNode } from "#src/models/SurveyExpressionUnaryNode";

// Every node of a parsed expression, told apart by its `type`
export type SurveyExpressionNode =
  | SurveyExpressionBinaryNode
  | SurveyExpressionCallNode
  | SurveyExpressionListNode
  | SurveyExpressionLiteralNode
  | SurveyExpressionReferenceNode
  | SurveyExpressionUnaryNode;
