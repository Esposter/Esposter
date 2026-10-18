import type { ConstantLoop } from "#src/models/genshinAssets/kits/gcsim/ConstantLoop";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { GO_MAX_LOOP_ITERATIONS } from "#src/services/genshinAssets/kits/constants";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";

// The blank identifier, which a loop's variable may be and which names no value an iteration carries
const GO_BLANK_IDENTIFIER = "_";

// The `for` loop opening at the position when it ranges over a constant slice, `for i, delay := range burstHitmarks {`,
// Its iterations the slice's indexes and elements, and its body's braces, else Undefined
export const readSliceRangeLoop = (
  tokens: readonly GoToken[],
  forPosition: number,
  resolveName: (name: string) => GoValue | undefined,
): ConstantLoop | undefined => {
  const [indexToken, valueToken] = [tokens[forPosition + 1], tokens[forPosition + 3]];
  if (
    indexToken?.kind !== GoTokenKind.Identifier ||
    !checkIsGoPunctuation(tokens[forPosition + 2], ",") ||
    valueToken?.kind !== GoTokenKind.Identifier ||
    !checkIsGoPunctuation(tokens[forPosition + 4], ":=") ||
    tokens[forPosition + 5]?.text !== "range"
  )
    return undefined;
  // The slice is named alone, its brace opening the body rather than a composite literal
  const sliceToken = tokens[forPosition + 6];
  const slice = sliceToken?.kind === GoTokenKind.Identifier ? resolveName(sliceToken.text) : undefined;
  const bodyStart = forPosition + 7;
  if (
    !checkIsGoPunctuation(tokens[bodyStart], "{") ||
    !Array.isArray(slice) ||
    slice.length > GO_MAX_LOOP_ITERATIONS ||
    !slice.every((element) => typeof element === "number")
  )
    return undefined;
  const bodyEnd = findClosing(tokens, bodyStart, "{", "}");
  return bodyEnd === undefined
    ? undefined
    : {
        bodyEnd,
        bodyStart,
        iterations: slice.map((element, index) => {
          const iteration = new Map<string, number>();
          if (indexToken.text !== GO_BLANK_IDENTIFIER) iteration.set(indexToken.text, index);
          if (valueToken.text !== GO_BLANK_IDENTIFIER) iteration.set(valueToken.text, element);
          return iteration;
        }),
      };
};
