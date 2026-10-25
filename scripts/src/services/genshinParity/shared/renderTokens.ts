import type { Token } from "#src/models/genshinParity/shared/Token";

import { needsSpace } from "#src/services/genshinParity/shared/needsSpace";

export const renderTokens = (tokens: Token[]): string => {
  let output = "";
  let previous: Token | undefined;
  for (const token of tokens) {
    if (previous && needsSpace(previous, token)) output += " ";
    output += token.text;
    previous = token;
  }
  return output;
};
