import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { checkIsInBlocks } from "#src/services/genshinAssets/kits/gcsim/checkIsInBlocks";
import { readOtherClosures } from "#src/services/genshinAssets/kits/gcsim/readOtherClosures";

// The default of a local declared with its ok flag, `travel, ok := p["travel"]`: the first constant its own assignments
// Give, `travel = 5` in the branch that defaults it, since the player's parameter is absent in the default run
export const findOkDefault = (
  tokens: readonly GoToken[],
  scope: GoNamedFunction,
  name: string,
  position: number,
  constantMap: ReadonlyMap<string, GoConstant>,
): number | undefined => {
  const otherClosures = readOtherClosures(tokens, scope, position);
  let isOkDeclared = false;
  let defaultStart: number | undefined;
  for (let previous = scope.bodyStart + 1; previous < position; previous++) {
    const value = tokens[previous + 2];
    if (
      tokens[previous]?.kind !== GoTokenKind.Identifier ||
      tokens[previous]?.text !== name ||
      checkIsGoPunctuation(tokens[previous - 1], ".") ||
      checkIsInBlocks(otherClosures, previous)
    )
      continue;
    if (checkIsGoPunctuation(tokens[previous + 1], ",") && checkIsGoPunctuation(tokens[previous + 3], ":="))
      isOkDeclared = true;
    else if (
      defaultStart === undefined &&
      (checkIsGoPunctuation(tokens[previous + 1], "=") || checkIsGoPunctuation(tokens[previous + 1], ":=")) &&
      (value?.kind === GoTokenKind.Number || (value?.kind === GoTokenKind.Identifier && constantMap.has(value.text)))
    )
      defaultStart = previous + 2;
  }
  return isOkDeclared ? defaultStart : undefined;
};
