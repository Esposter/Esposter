import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";

const OPENING_BRACKETS = new Set(["(", "[", "{"]);
const CLOSING_BRACKETS = new Set([")", "]", "}"]);

// The position after the bracketed run opening at the position, nested brackets and all
export const skipGoBrackets = (tokens: readonly GoToken[], start: number): number => {
  let depth = 0;
  let position = start;
  do {
    const token = tokens[position];
    if (token === undefined) return position;
    if (token.kind === GoTokenKind.Punctuation && OPENING_BRACKETS.has(token.text)) depth++;
    else if (token.kind === GoTokenKind.Punctuation && CLOSING_BRACKETS.has(token.text)) depth--;
    position++;
  } while (depth > 0);
  return position;
};
