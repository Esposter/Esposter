import type { MathExpressionParserState } from "#src/models/MathExpressionParserState";

import { MathExpressionTokenType } from "#src/models/MathExpressionTokenType";
import { BASE_DIGITS_REGEX, DECIMAL_MARK_OPERATOR_FOLLOWERS, DIGIT_REGEX } from "#src/services/constants";
import { failMathExpression } from "#src/services/failMathExpression";
import { getMathExpressionCharacter } from "#src/services/getMathExpressionCharacter";
import { takeMatchingCharacters } from "#src/services/takeMatchingCharacters";

// A binary, octal or hexadecimal literal takes only the digits its radix has, as mathjs does.
// It takes a radix point and a word size after them. A prefix with no digit after it is a zero.
// The letter that follows is a name, so 0x with x = 3 is 0
const readRadixNumber = (state: MathExpressionParserState, prefix: string, baseDigits: RegExp): void => {
  state.index += 2;
  let digits = takeMatchingCharacters(state, baseDigits);
  if (digits === "") {
    state.index--;
    state.token = "0";
    state.tokenType = MathExpressionTokenType.Number;
    return;
  }
  // Mathjs takes a radix point after the digits even when no digit follows it, so 0x1. is 1
  if (getMathExpressionCharacter(state, 0) === ".") {
    state.index++;
    digits += `.${takeMatchingCharacters(state, baseDigits)}`;
  }
  let wordSize = "";
  if (getMathExpressionCharacter(state, 0) === "i" && DIGIT_REGEX.test(getMathExpressionCharacter(state, 1))) {
    state.index++;
    wordSize = `i${takeMatchingCharacters(state, DIGIT_REGEX)}`;
  }
  state.token = `0${prefix}${digits}${wordSize}`;
  state.tokenType = MathExpressionTokenType.Number;
};
// A decimal mark that mathjs reads as a dot of its own, unless a division, product or power follows it
const checkIsDecimalMark = (character: string, nextCharacter: string): boolean =>
  character === "." && !DECIMAL_MARK_OPERATOR_FOLLOWERS.has(nextCharacter);
// Reports a decimal mark where an exponent's digits must be, at the number's start, as mathjs does
const failExponent = (state: MathExpressionParserState, text: string): void => {
  state.token = text;
  failMathExpression(state, `Digit expected, got "${getMathExpressionCharacter(state, 0)}"`);
};
// Takes the exponent after a number's digits, if it has one, and yields the number's text with it
const takeExponent = (state: MathExpressionParserState, text: string): string => {
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

  const taken = text + exponent + takeMatchingCharacters(state, DIGIT_REGEX);
  if (checkIsDecimalMark(getMathExpressionCharacter(state, 0), getMathExpressionCharacter(state, 1)))
    failExponent(state, taken);
  return taken;
};

export const readMathExpressionNumber = (state: MathExpressionParserState): void => {
  const prefix = getMathExpressionCharacter(state, 1);
  const baseDigits = BASE_DIGITS_REGEX[prefix];
  if (getMathExpressionCharacter(state, 0) === "0" && baseDigits !== undefined) {
    readRadixNumber(state, prefix, baseDigits);
    return;
  }

  let text = takeMatchingCharacters(state, DIGIT_REGEX);
  if (getMathExpressionCharacter(state, 0) === ".") {
    text += ".";
    state.index++;
    text += takeMatchingCharacters(state, DIGIT_REGEX);
  }
  state.token = takeExponent(state, text);
  state.tokenType = MathExpressionTokenType.Number;
};
