import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { checkIsDecimalMark } from "#src/services/parser/token/checkIsDecimalMark";
import { DIGIT_REGEX } from "#src/services/parser/token/constants";
import { failExponent } from "#src/services/parser/token/failExponent";
import { getMathExpressionCharacter } from "#src/services/parser/token/getMathExpressionCharacter";
import { takeMathExpressionMatching } from "#src/services/parser/token/takeMathExpressionMatching";

// Takes the exponent after a number's digits, if it has one, and yields the number's text with it
export const takeExponent = (state: MathExpressionParserState, text: string): string => {
  const exponentMarker = getMathExpressionCharacter(state, 0);
  if (exponentMarker !== "e" && exponentMarker !== "E") return text;

  const afterMarker = getMathExpressionCharacter(state, 1);
  if (checkIsDecimalMark(afterMarker, getMathExpressionCharacter(state, 2))) {
    state.index++;
    failExponent(state, text);
    return text;
  }
  if (!DIGIT_REGEX.test(afterMarker) && afterMarker !== "+" && afterMarker !== "-") return text;

  state.index++;
  let exponent = "e";
  if (afterMarker === "+" || afterMarker === "-") {
    exponent += afterMarker;
    state.index++;
  }
  if (!DIGIT_REGEX.test(getMathExpressionCharacter(state, 0))) {
    const partial = text + exponent;
    failExponent(state, partial);
    return partial;
  }

  const taken = text + exponent + takeMathExpressionMatching(state, DIGIT_REGEX);
  if (checkIsDecimalMark(getMathExpressionCharacter(state, 0), getMathExpressionCharacter(state, 1)))
    failExponent(state, taken);
  return taken;
};
