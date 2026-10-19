import type { ConstantLoop } from "#src/models/genshinAssets/kits/gcsim/ConstantLoop";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { GO_MAX_LOOP_ITERATIONS } from "#src/services/genshinAssets/kits/constants";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";

// The blank identifier, which a loop's variable may be and which names no value an iteration carries
const GO_BLANK_IDENTIFIER = "_";

// Whether a value is a slice of numbers, as each row of a slice of number slices is
const checkIsNumberSlice = (value: GoValue): boolean =>
  Array.isArray(value) && value.every((element) => typeof element === "number");

// The `for` loop opening at the position when it ranges over a constant slice, `for i, delay := range burstHitmarks {`,
// Or `for i := range burstRows {` over a slice of number slices, a row at a time. Its iterations are the indexes,
// With its elements as the value variable when it is a slice of numbers, and its body's braces, else Undefined
export const readSliceRangeLoop = (
  tokens: readonly GoToken[],
  forPosition: number,
  resolveName: (name: string) => GoValue | undefined,
): ConstantLoop | undefined => {
  const indexToken = tokens[forPosition + 1];
  const isValueNamed = checkIsGoPunctuation(tokens[forPosition + 2], ",");
  const valueToken = isValueNamed ? tokens[forPosition + 3] : undefined;
  const operatorPosition = forPosition + (isValueNamed ? 4 : 2);
  if (
    indexToken?.kind !== GoTokenKind.Identifier ||
    (isValueNamed && valueToken?.kind !== GoTokenKind.Identifier) ||
    !checkIsGoPunctuation(tokens[operatorPosition], ":=") ||
    tokens[operatorPosition + 1]?.text !== "range"
  )
    return undefined;
  // The slice is named alone, its brace opening the body rather than a composite literal
  const sliceToken = tokens[operatorPosition + 2];
  const slice = sliceToken?.kind === GoTokenKind.Identifier ? resolveName(sliceToken.text) : undefined;
  const bodyStart = operatorPosition + 3;
  if (
    !checkIsGoPunctuation(tokens[bodyStart], "{") ||
    !Array.isArray(slice) ||
    slice.length > GO_MAX_LOOP_ITERATIONS ||
    !(slice.every((element) => typeof element === "number") || slice.every((row) => checkIsNumberSlice(row)))
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
          // A row is no number, so a range over rows binds its index alone
          if (typeof element === "number" && valueToken !== undefined && valueToken.text !== GO_BLANK_IDENTIFIER)
            iteration.set(valueToken.text, element);
          return iteration;
        }),
      };
};
