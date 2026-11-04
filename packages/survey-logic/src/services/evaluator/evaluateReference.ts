import type { SurveyExpressionReferenceNode } from "#src/models/SurveyExpressionReferenceNode";
import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readSurveyLogicReference } from "#src/services/evaluator/readSurveyLogicReference";

export const evaluateReference = (node: SurveyExpressionReferenceNode, context: SurveyLogicContext): SurveyLogicValue =>
  readSurveyLogicReference(node.name, context);
