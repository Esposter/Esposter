import type { SurveyExpressionParse } from "#src/models/SurveyExpressionParse";

import { parseBinaryOperators } from "#src/services/parser/parseBinaryOperators";
import { parseOperand } from "#src/services/parser/parseOperand";

// Parses an operand, then the binary operators that bind at least as tightly as the minimum power. This is the one
// Function that parses a binary expression, so the callback it hands the others is itself
export const parseBinary: SurveyExpressionParse = (state, minimumPower) =>
  parseOperand(state, parseBinary).andThen((left) => parseBinaryOperators(state, left, minimumPower, parseBinary));
