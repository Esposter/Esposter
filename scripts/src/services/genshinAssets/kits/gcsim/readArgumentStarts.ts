import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

const skipNewlines = (tokens: readonly GoToken[], position: number): number => {
  let cursor = position;
  while (tokens[cursor]?.kind === GoTokenKind.Newline) cursor++;
  return cursor;
};

// The first token of each argument of the call opening at the position, from its parenthesis to its closing one
export const readArgumentStarts = (tokens: readonly GoToken[], openingPosition: number): number[] => {
  const starts: number[] = [];
  let position = skipNewlines(tokens, openingPosition + 1);
  while (tokens[position] !== undefined && !checkIsGoPunctuation(tokens[position], ")")) {
    starts.push(position);
    position = skipNewlines(tokens, parseGoExpression(tokens, position).end);
    if (checkIsGoPunctuation(tokens[position], ",")) position = skipNewlines(tokens, position + 1);
  }
  return starts;
};
