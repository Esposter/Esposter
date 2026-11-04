import type { SurveyExpressionReferenceNode } from "#src/models/SurveyExpressionReferenceNode";
import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readSurveyLogicReference } from "#src/services/evaluator/readSurveyLogicReference";

// A reference reads its answer as the context holds it. The caller reads its stored answers once, through toSurveyLogicAnswer, before it builds the context, so no null is here
export const evaluateReference = (node: SurveyExpressionReferenceNode, context: SurveyLogicContext): SurveyLogicValue =>
  readSurveyLogicReference(node.name, context);
