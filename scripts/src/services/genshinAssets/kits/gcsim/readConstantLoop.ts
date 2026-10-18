import type { ConstantLoop } from "#src/models/genshinAssets/kits/gcsim/ConstantLoop";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { GO_MAX_LOOP_ITERATIONS } from "#src/services/genshinAssets/kits/constants";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readRangeLoop } from "#src/services/genshinAssets/kits/gcsim/readRangeLoop";
import { readSliceRangeLoop } from "#src/services/genshinAssets/kits/gcsim/readSliceRangeLoop";

// The `for` loop opening at the position when it counts a variable from a constant start up to a constant bound in
// Constant steps, its values and its body's braces, else Undefined
export const readConstantLoop = (
  tokens: readonly GoToken[],
  forPosition: number,
  resolveName: (name: string) => GoValue | undefined,
): ConstantLoop | undefined => {
  const rangeLoop = readRangeLoop(tokens, forPosition, resolveName);
  if (rangeLoop !== undefined) return rangeLoop;
  const sliceLoop = readSliceRangeLoop(tokens, forPosition, resolveName);
  if (sliceLoop !== undefined) return sliceLoop;
  const variable = tokens[forPosition + 1];
  if (variable?.kind !== GoTokenKind.Identifier || !checkIsGoPunctuation(tokens[forPosition + 2], ":="))
    return undefined;
  const start = parseGoExpression(tokens, forPosition + 3);
  if (
    !checkIsGoPunctuation(tokens[start.end], ";") ||
    tokens[start.end + 1]?.text !== variable.text ||
    !(checkIsGoPunctuation(tokens[start.end + 2], "<") || checkIsGoPunctuation(tokens[start.end + 2], "<="))
  )
    return undefined;
  const isBoundInclusive = checkIsGoPunctuation(tokens[start.end + 2], "<=");
  const bound = parseGoExpression(tokens, start.end + 3);
  const stepStart = bound.end + 1;
  if (!checkIsGoPunctuation(tokens[bound.end], ";") || tokens[stepStart]?.text !== variable.text) return undefined;
  // `i++` steps by one, `i += 90` by its expression
  const isIncrement = checkIsGoPunctuation(tokens[stepStart + 1], "++");
  const isAddAssign =
    checkIsGoPunctuation(tokens[stepStart + 1], "+") && checkIsGoPunctuation(tokens[stepStart + 2], "=");
  if (!isIncrement && !isAddAssign) return undefined;
  const step = isIncrement ? undefined : parseGoExpression(tokens, stepStart + 3);
  const stepEnd = step === undefined ? stepStart + 2 : step.end;
  if (!checkIsGoPunctuation(tokens[stepEnd], "{")) return undefined;
  const startValue = evaluateGoNumber(start.expression, resolveName);
  const boundValue = evaluateGoNumber(bound.expression, resolveName);
  const stepValue = step === undefined ? 1 : evaluateGoNumber(step.expression, resolveName);
  if (
    typeof startValue !== "number" ||
    typeof boundValue !== "number" ||
    typeof stepValue !== "number" ||
    stepValue <= 0
  )
    return undefined;
  const values: number[] = [];
  for (let value = startValue; isBoundInclusive ? value <= boundValue : value < boundValue; value += stepValue) {
    if (values.length === GO_MAX_LOOP_ITERATIONS) return undefined;
    values.push(value);
  }
  const bodyEnd = findClosing(tokens, stepEnd, "{", "}");
  return bodyEnd === undefined
    ? undefined
    : { bodyEnd, bodyStart: stepEnd, iterations: values.map((value) => new Map([[variable.text, value]])) };
};
