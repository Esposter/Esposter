import type { ConstantLoop } from "#src/models/genshinAssets/kits/gcsim/ConstantLoop";
import type { GoScope } from "#src/models/genshinAssets/kits/gcsim/GoScope";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { readConstantLoop } from "#src/services/genshinAssets/kits/gcsim/readConstantLoop";

// Each constant loop of a file at a constellation, read at its `for` keyword. The base kit is constellation zero
export const readConstantLoops = (tokens: readonly GoToken[], scope: GoScope, constellation = 0): ConstantLoop[] => {
  const loops: ConstantLoop[] = [];
  for (const [position, token] of tokens.entries()) {
    if (token.kind !== GoTokenKind.Identifier || token.text !== "for") continue;
    const loop = readConstantLoop(
      tokens,
      position,
      (name) => scope.resolveName(name, position),
      (name) => scope.resolveConstellationName(name, position, constellation),
    );
    if (loop !== undefined) loops.push(loop);
  }
  return loops;
};
