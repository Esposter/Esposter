// Read as mathjs reads them: the symbols of three, two and one character, longest first.
// The words that are operators rather than names are delimiters too
export const DELIMITERS_OF_THREE: ReadonlySet<string> = new Set([">>>"]);
export const DELIMITERS_OF_TWO: ReadonlySet<string> = new Set([
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
export const DELIMITERS_OF_ONE: ReadonlySet<string> = new Set([
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
export const NAMED_DELIMITERS: ReadonlySet<string> = new Set(["and", "in", "mod", "not", "or", "to", "xor"]);
export const DECIMAL_MARK_OPERATOR_FOLLOWERS: ReadonlySet<string> = new Set(["*", "/", "^"]);
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const WORD_START_REGEX: RegExp = /^[\p{L}_$]$/u;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const WORD_CHARACTER_REGEX: RegExp = /^[\p{L}\p{Nd}_$]$/u;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const DIGIT_REGEX: RegExp = /^[0-9]$/u;
export const BASE_DIGITS_REGEX: Readonly<Record<string, RegExp>> = { b: /^[01]$/u, o: /^[0-7]$/u, x: /^[0-9a-fA-F]$/u };
