import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { evaluateBinary } from "#src/services/evaluator/evaluateBinary";
import { evaluateCall } from "#src/services/evaluator/evaluateCall";
import { evaluateList } from "#src/services/evaluator/evaluateList";
import { evaluateReference } from "#src/services/evaluator/evaluateReference";
import { evaluateUnary } from "#src/services/evaluator/evaluateUnary";
import { exhaustiveGuard } from "@esposter/shared";

// Evaluates a parsed expression over the context's answers.
// Each node type has its own evaluator, which reaches its children through this function, so no evaluator imports it
export const evaluateSurveyExpression = (node: SurveyExpressionNode, context: SurveyLogicContext): SurveyLogicValue => {
  switch (node.type) {
    case SurveyExpressionNodeType.Binary:
      return evaluateBinary(node, context, evaluateSurveyExpression);
    case SurveyExpressionNodeType.Call:
      return evaluateCall(node, context, evaluateSurveyExpression);
    case SurveyExpressionNodeType.List:
      return evaluateList(node, context, evaluateSurveyExpression);
    case SurveyExpressionNodeType.Literal:
      return node.value;
    case SurveyExpressionNodeType.Reference:
      return evaluateReference(node, context);
    case SurveyExpressionNodeType.Unary:
      return evaluateUnary(node, context, evaluateSurveyExpression);
    default:
      return exhaustiveGuard(node);
  }
};
