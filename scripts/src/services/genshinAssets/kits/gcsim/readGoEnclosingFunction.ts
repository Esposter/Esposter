import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";

// The innermost named function a position is in, its body opening last among those enclosing it, else undefined. A
// Closure in a function is in that function, as the closure runs in its body
export const readGoEnclosingFunction = (
  namedFunctions: readonly GoNamedFunction[],
  position: number,
): GoNamedFunction | undefined =>
  namedFunctions
    .filter(({ bodyEnd, bodyStart }) => bodyStart < position && position < bodyEnd)
    .reduce<GoNamedFunction | undefined>(
      (innermost, namedFunction) =>
        innermost === undefined || namedFunction.bodyStart > innermost.bodyStart ? namedFunction : innermost,
      undefined,
    );
