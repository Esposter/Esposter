import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";

export const skipToNewline = (tokens: readonly GoToken[], start: number): number => {
  let position = start;
  while (position < tokens.length && tokens[position]?.kind !== GoTokenKind.Newline) position++;
  return position + 1;
};
