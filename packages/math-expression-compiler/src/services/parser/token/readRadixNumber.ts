import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { DIGIT_REGEX } from "#src/services/parser/token/constants";
import { getMathExpressionCharacter } from "#src/services/parser/token/getMathExpressionCharacter";
import { takeMathExpressionMatching } from "#src/services/parser/token/takeMathExpressionMatching";

// A binary, octal or hexadecimal literal takes only the digits its radix has, as mathjs does.
// It takes a radix point and a word size after them. A prefix with no digit after it is a zero.
// The letter that follows is a name, so 0x with x = 3 is 0
export const readRadixNumber = (state: MathExpressionParserState, prefix: string, baseDigits: RegExp): void => {
  state.index += 2;
  let digits = takeMathExpressionMatching(state, baseDigits);
  if (digits === "") {
    state.index--;
    state.token = "0";
    state.tokenType = MathExpressionTokenType.Number;
    return;
  }
  // Mathjs takes a radix point after the digits even when no digit follows it, so 0x1. is 1
  if (getMathExpressionCharacter(state, 0) === ".") {
    state.index++;
    digits += `.${takeMathExpressionMatching(state, baseDigits)}`;
  }
  let wordSize = "";
  if (getMathExpressionCharacter(state, 0) === "i" && DIGIT_REGEX.test(getMathExpressionCharacter(state, 1))) {
    state.index++;
    wordSize = `i${takeMathExpressionMatching(state, DIGIT_REGEX)}`;
  }
  state.token = `0${prefix}${digits}${wordSize}`;
  state.tokenType = MathExpressionTokenType.Number;
};
