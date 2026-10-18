import type { ConstantLoop } from "#src/models/genshinAssets/kits/gcsim/ConstantLoop";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { GO_MAX_LOOP_ITERATIONS } from "#src/services/genshinAssets/kits/constants";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

// The `for` loop opening at the position when it ranges over a constant count, `for i := range 19 {` or `for range 2 {`,
// Its values the counts from zero, and its body's braces, else Undefined
export const readRangeLoop = (
  tokens: readonly GoToken[],
  forPosition: number,
  resolveName: (name: string) => GoValue | undefined,
): ConstantLoop | undefined => {
  const isNamed = checkIsGoPunctuation(tokens[forPosition + 2], ":=") && tokens[forPosition + 3]?.text === "range";
  const variable = isNamed ? tokens[forPosition + 1] : undefined;
  if (isNamed ? variable?.kind !== GoTokenKind.Identifier : tokens[forPosition + 1]?.text !== "range") return undefined;
  const boundStart = forPosition + (isNamed ? 4 : 2);
  const bound = parseGoExpression(tokens, boundStart, true);
  const boundValue = evaluateGoNumber(bound.expression, resolveName);
  if (
    !checkIsGoPunctuation(tokens[bound.end], "{") ||
    typeof boundValue !== "number" ||
    boundValue > GO_MAX_LOOP_ITERATIONS
  )
    return undefined;
  const bodyEnd = findClosing(tokens, bound.end, "{", "}");
  return bodyEnd === undefined
    ? undefined
    : {
        bodyEnd,
        bodyStart: bound.end,
        iterations: Array.from({ length: Math.max(0, boundValue) }, (_, value) =>
          variable === undefined ? new Map<string, number>() : new Map([[variable.text, value]]),
        ),
      };
};
