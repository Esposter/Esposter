import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { DIGIT_REGEX } from "#src/services/parser/token/constants";
import { getMathExpressionCharacter } from "#src/services/parser/token/getMathExpressionCharacter";
import { MathExpressionRadixMap } from "#src/services/parser/token/MathExpressionRadixMap";
import { readRadixNumber } from "#src/services/parser/token/readRadixNumber";
import { takeExponent } from "#src/services/parser/token/takeExponent";
import { takeMathExpressionMatching } from "#src/services/parser/token/takeMathExpressionMatching";

export const readMathExpressionNumber = (state: MathExpressionParserState): void => {
  const prefix = getMathExpressionCharacter(state, 1);
  const radixEntry = MathExpressionRadixMap[prefix];
  if (getMathExpressionCharacter(state, 0) === "0" && radixEntry !== undefined) {
    readRadixNumber(state, prefix, radixEntry.digit);
    return;
  }

  let text = takeMathExpressionMatching(state, DIGIT_REGEX);
  if (getMathExpressionCharacter(state, 0) === ".") {
    text += ".";
    state.index++;
    text += takeMathExpressionMatching(state, DIGIT_REGEX);
  }
  state.token = takeExponent(state, text);
  state.tokenType = MathExpressionTokenType.Number;
};
