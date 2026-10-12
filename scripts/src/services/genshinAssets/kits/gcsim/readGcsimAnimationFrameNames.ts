import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { getGoRootName } from "#src/services/genshinAssets/kits/gcsim/getGoRootName";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readGoAliases, resolveGoAlias } from "#src/services/genshinAssets/kits/gcsim/readGoAliases";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { posix } from "node:path";

// The name of the first indexed frames in an expression, `skillEndFrames` in `delay + skillEndFrames[next] + skillHitmark`
const findIndexedName = (expression: GoExpression): string | undefined => {
  if (expression.kind === GoExpressionKind.Index) return getGoRootName(expression);
  else if (expression.kind === GoExpressionKind.Binary)
    return findIndexedName(expression.left) ?? findIndexedName(expression.right);
  else return undefined;
};

// The frames each ability file animates by, from the `AnimationLength` its action literal is given: an ability whose
// Frames are named otherwise, `skillThrustFrames` in `AnimationLength: skillThrustFrames[action.InvalidAction]`. Keyed by
// The file's base name, and the last such literal in a file wins, the main one returned after any nested one
export const readGcsimAnimationFrameNames = (sources: readonly GoSource[]): Map<string, string> => {
  const frameNameMap = new Map<string, string>();
  for (const { path, source } of sources) {
    const tokens = tokenizeGo(source);
    const aliasMap = readGoAliases(tokens);
    for (const [position, token] of tokens.entries()) {
      if (token.text !== "AnimationLength" || !checkIsGoPunctuation(tokens[position + 1], ":")) continue;
      const name = findIndexedName(parseGoExpression(tokens, position + 2).expression);
      const frameName = resolveGoAlias(aliasMap, name);
      if (frameName !== undefined) frameNameMap.set(posix.basename(path), frameName);
    }
  }
  return frameNameMap;
};
