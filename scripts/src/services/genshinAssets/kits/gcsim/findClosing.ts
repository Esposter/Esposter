import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

// The position of the bracket closing the one opening at the position, its nested pairs counted, else undefined
export const findClosing = (
  tokens: readonly GoToken[],
  openingPosition: number,
  opening: string,
  closing: string,
): number | undefined => {
  let depth = 0;
  for (let position = openingPosition; position < tokens.length; position++)
    if (checkIsGoPunctuation(tokens[position], opening)) depth++;
    else if (checkIsGoPunctuation(tokens[position], closing) && --depth === 0) return position;
  return undefined;
};
