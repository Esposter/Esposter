import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";

// The punctuation an expression starts after: a call's or a group's opening, a list's separator, a literal's opening,
// And the `=` or `:=` a value is assigned by
const EXPRESSION_START_PUNCTUATION = new Set(["(", ",", ":=", "=", "{"]);
// The keyword a switch's case value follows
const CASE_KEYWORD = "case";

// The token positions on a line that begin an expression: the line's first token, and each token that follows an
// Argument's, element's, assigned value's or case's opening. A token after an operator is an operand of its expression,
// So it starts none of its own
export const readGcsimLineExpressionStarts = (tokens: readonly GoToken[], line: number): number[] =>
  tokens.flatMap((token, position) => {
    if (token.line !== line || token.kind === GoTokenKind.Newline) return [];
    const previous = tokens[position - 1];
    const isStart =
      previous === undefined ||
      previous.kind === GoTokenKind.Newline ||
      (previous.kind === GoTokenKind.Punctuation && EXPRESSION_START_PUNCTUATION.has(previous.text)) ||
      (previous.kind === GoTokenKind.Identifier && previous.text === CASE_KEYWORD);
    return isStart ? [position] : [];
  });
