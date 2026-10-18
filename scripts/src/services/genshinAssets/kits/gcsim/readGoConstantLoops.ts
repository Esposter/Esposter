import type { ConstantLoop } from "#src/models/genshinAssets/kits/gcsim/ConstantLoop";
import type { GoScope } from "#src/models/genshinAssets/kits/gcsim/GoScope";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { readConstantLoop } from "#src/services/genshinAssets/kits/gcsim/readConstantLoop";

// Each constant loop of a file, read at its `for` keyword
export const readConstantLoops = (tokens: readonly GoToken[], scope: GoScope): ConstantLoop[] => {
  const loops: ConstantLoop[] = [];
  for (const [position, token] of tokens.entries()) {
    if (token.kind !== GoTokenKind.Identifier || token.text !== "for") continue;
    const loop = readConstantLoop(tokens, position, (name) => scope.resolveName(name, position));
    if (loop !== undefined) loops.push(loop);
  }
  return loops;
};
