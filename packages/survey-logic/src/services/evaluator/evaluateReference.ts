import type { SurveyExpressionReferenceNode } from "#src/models/SurveyExpressionReferenceNode";
import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readSurveyLogicReference } from "#src/services/evaluator/readSurveyLogicReference";
import { toSurveyLogicAnswer } from "#src/services/shared/toSurveyLogicAnswer";

// A reference reads its answer as SurveyJS reads one, so a numeric text is a number and a boolean text a boolean
export const evaluateReference = (node: SurveyExpressionReferenceNode, context: SurveyLogicContext): SurveyLogicValue =>
  toSurveyLogicAnswer(readSurveyLogicReference(node.name, context));
