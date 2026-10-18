import type { MathExpressionParserState } from "#src/models/MathExpressionParserState";

import { MathExpressionTokenType } from "#src/models/MathExpressionTokenType";
import { failMathExpression } from "#src/services/failMathExpression";

// Read as mathjs reads them: the symbols of three, two and one character, longest first, and the words that are
// Operators rather than names
const DELIMITERS_OF_THREE: ReadonlySet<string> = new Set([">>>"]);
const DELIMITERS_OF_TWO: ReadonlySet<string> = new Set([
  "!=",
  ".*",
  "./",
  ".^",
  "<<",
  "<=",
  "==",
  ">=",
  ">>",
  "??",
  "^|",
]);
const DELIMITERS_OF_ONE: ReadonlySet<string> = new Set([
  "!",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  "/",
  ":",
  "<",
  "=",
  ">",
  "?",
  "[",
  "]",
  "^",
  "|",
  "~",
]);
const NAMED_DELIMITERS: ReadonlySet<string> = new Set(["and", "in", "mod", "not", "or", "to", "xor"]);
const WORD_START_REGEX = /^[\p{L}_$]$/u;
const WORD_CHARACTER_REGEX = /^[\p{L}\p{Nd}_$]$/u;
const DIGIT_REGEX = /^[0-9]$/u;
const BASE_DIGITS_REGEX: Readonly<Record<string, RegExp>> = { b: /^[01]$/u, o: /^[0-7]$/u, x: /^[0-9a-fA-F]$/u };

const getCharacter = (state: MathExpressionParserState, offset: number): string =>
  state.source.charAt(state.index + offset);

const skipSpaces = (state: MathExpressionParserState): void => {
  while (state.index < state.source.length) {
    const character = getCharacter(state, 0);
    if (character === " " || character === "\t" || (character === "\n" && state.nestingLevel > 0)) state.index++;
    else if (character === "#")
      while (state.index < state.source.length && getCharacter(state, 0) !== "\n") state.index++;
    else break;
  }
};

// Takes the characters, from the current one, that the pattern matches, and yields them
const takeMatching = (state: MathExpressionParserState, pattern: RegExp): string => {
  let taken = "";
  while (pattern.test(getCharacter(state, 0))) {
    taken += getCharacter(state, 0);
    state.index++;
  }
  return taken;
};

// A binary, octal or hexadecimal literal takes only the digits its radix has, as mathjs does, with a radix point and a word
// Size after them. A prefix with no digit after it is a zero, and the letter that follows is a name, so 0x with x = 3 is 0
const readRadixNumber = (state: MathExpressionParserState, prefix: string, baseDigits: RegExp): void => {
  state.index += 2;
  let digits = takeMatching(state, baseDigits);
  if (digits === "") {
    state.index--;
    state.token = "0";
    state.tokenType = MathExpressionTokenType.Number;
    return;
  }

  // Mathjs takes a radix point after the digits even when no digit follows it, so 0x1. is 1
  if (getCharacter(state, 0) === ".") {
    state.index++;
    digits += `.${takeMatching(state, baseDigits)}`;
  }
  let wordSize = "";
  if (getCharacter(state, 0) === "i" && DIGIT_REGEX.test(getCharacter(state, 1))) {
    state.index++;
    wordSize = `i${takeMatching(state, DIGIT_REGEX)}`;
  }
  state.token = `0${prefix}${digits}${wordSize}`;
  state.tokenType = MathExpressionTokenType.Number;
};

const readNumber = (state: MathExpressionParserState): void => {
  const prefix = getCharacter(state, 1);
  const baseDigits = BASE_DIGITS_REGEX[prefix];
  if (getCharacter(state, 0) === "0" && baseDigits !== undefined) {
    readRadixNumber(state, prefix, baseDigits);
    return;
  }

  let text = takeMatching(state, DIGIT_REGEX);
  if (getCharacter(state, 0) === ".") {
    text += ".";
    state.index++;
    text += takeMatching(state, DIGIT_REGEX);
  }
  const exponentMarker = getCharacter(state, 0);
  if (exponentMarker === "e" || exponentMarker === "E") {
    const afterMarker = getCharacter(state, 1);
    if (DIGIT_REGEX.test(afterMarker)) {
      text += "e";
      state.index++;
      text += takeMatching(state, DIGIT_REGEX);
    } else if (afterMarker === "+" || afterMarker === "-") {
      text += `e${afterMarker}`;
      state.index += 2;
      if (!DIGIT_REGEX.test(getCharacter(state, 0))) {
        failMathExpression(state, `Digit expected, got "${getCharacter(state, 0)}"`);
        return;
      }
      text += takeMatching(state, DIGIT_REGEX);
    }
  }
  state.token = text;
  state.tokenType = MathExpressionTokenType.Number;
};

const readWord = (state: MathExpressionParserState): void => {
  const start = state.index;
  while (state.index < state.source.length && WORD_CHARACTER_REGEX.test(getCharacter(state, 0))) state.index++;
  state.token = state.source.slice(start, state.index);
  state.tokenType = NAMED_DELIMITERS.has(state.token)
    ? MathExpressionTokenType.Delimiter
    : MathExpressionTokenType.Symbol;
};

const readDelimiter = (state: MathExpressionParserState): boolean => {
  const threeCharacters = state.source.slice(state.index, state.index + 3);
  const twoCharacters = state.source.slice(state.index, state.index + 2);
  const oneCharacter = getCharacter(state, 0);
  let length = 0;
  if (DELIMITERS_OF_THREE.has(threeCharacters)) length = 3;
  else if (DELIMITERS_OF_TWO.has(twoCharacters)) length = 2;
  else if (DELIMITERS_OF_ONE.has(oneCharacter)) length = 1;
  if (length === 0) return false;

  state.token = state.source.slice(state.index, state.index + length);
  state.index += length;
  state.tokenType = MathExpressionTokenType.Delimiter;
  if (state.token === "(" || state.token === "[") state.nestingLevel++;
  if (state.token === ")" || state.token === "]") state.nestingLevel--;
  return true;
};

// Reads the next token into the state, leaving it empty at the end of the formula. A token that starts with a digit,
// Or a dot before one, is a number; a word is a name or, when it is one of the named operators, a delimiter
export const getMathExpressionToken = (state: MathExpressionParserState): void => {
  state.token = "";
  state.tokenType = MathExpressionTokenType.Null;
  skipSpaces(state);
  if (state.index >= state.source.length || state.error !== null) return;

  const character = getCharacter(state, 0);
  const next = getCharacter(state, 1);
  if (DIGIT_REGEX.test(character) || (character === "." && DIGIT_REGEX.test(next))) readNumber(state);
  else if (WORD_START_REGEX.test(character)) readWord(state);
  else if (!readDelimiter(state)) {
    state.token = character;
    state.index++;
    state.tokenType = MathExpressionTokenType.Unknown;
  }
};
