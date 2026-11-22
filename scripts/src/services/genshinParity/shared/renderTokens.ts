import type { Token } from "#src/models/genshinParity/shared/Token";

import { checkNeedsSpace } from "#src/services/genshinParity/shared/checkNeedsSpace";

export const renderTokens = (tokens: Token[]): string => {
  let output = "";
  let previous: Token | undefined;
  for (const token of tokens) {
    if (previous && checkNeedsSpace(previous, token)) output += " ";
    output += token.text;
    previous = token;
  }
  return output;
};
