import { MathExpressionBinaryOperatorSymbol } from "#src/models/parser/MathExpressionBinaryOperatorSymbol";

const BINARY_SYMBOLS = Object.values(MathExpressionBinaryOperatorSymbol);
// The word operators are read as words, so only the symbolic ones are delimiters
const SYMBOLIC_BINARY_SYMBOLS = BINARY_SYMBOLS.filter((symbol) => !/\p{L}/u.test(symbol));
const SYMBOLIC_BINARY_SYMBOLS_OF_THREE = SYMBOLIC_BINARY_SYMBOLS.filter((symbol) => symbol.length === 3);
const SYMBOLIC_BINARY_SYMBOLS_OF_TWO = SYMBOLIC_BINARY_SYMBOLS.filter((symbol) => symbol.length === 2);
const SYMBOLIC_BINARY_SYMBOLS_OF_ONE = SYMBOLIC_BINARY_SYMBOLS.filter((symbol) => symbol.length === 1);

// Read as mathjs reads them: the symbols of three, two and one character, longest first.
// The words that are operators rather than names are delimiters too
export const DELIMITERS_OF_THREE: ReadonlySet<string> = new Set(SYMBOLIC_BINARY_SYMBOLS_OF_THREE);
export const DELIMITERS_OF_TWO: ReadonlySet<string> = new Set([...SYMBOLIC_BINARY_SYMBOLS_OF_TWO, "??", ".^"]);
export const DELIMITERS_OF_ONE: ReadonlySet<string> = new Set([
  ...SYMBOLIC_BINARY_SYMBOLS_OF_ONE,
  "!",
  "'",
  "(",
  ")",
  ",",
  ":",
  "=",
  "?",
  "[",
  "]",
  "^",
  "~",
]);
// The characters that begin a longer delimiter, so a read looks at a longer one only where it can start
export const FIRST_CHARACTERS_OF_THREE: ReadonlySet<string> = new Set(
  Array.from(DELIMITERS_OF_THREE, (delimiter) => delimiter.charAt(0)),
);
export const FIRST_CHARACTERS_OF_TWO: ReadonlySet<string> = new Set(
  Array.from(DELIMITERS_OF_TWO, (delimiter) => delimiter.charAt(0)),
);
export const NAMED_DELIMITERS: ReadonlySet<string> = new Set(["and", "in", "mod", "not", "or", "to", "xor"]);
export const DECIMAL_MARK_OPERATOR_FOLLOWERS: ReadonlySet<string> = new Set(["*", "/", "^"]);
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const WORD_START_REGEX: RegExp = /^[\p{L}_$]$/u;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const WORD_CHARACTER_REGEX: RegExp = /^[\p{L}\p{Nd}_$]$/u;
