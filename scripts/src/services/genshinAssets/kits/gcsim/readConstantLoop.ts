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

// The `for` loop opening at the position when it counts a variable from a constant start up to a bound, its values and
// Its body's braces, else Undefined. The bound is read at the constellation, so a constellation branch's `=` to a local
// The bound names is taken or left out as the constellation reaches it. A step the reader cannot evaluate, as in
// `i += c.call()`, is not unrolled: the loop gives its first iteration alone, at its start, or none if the bound
// Stops it before then
export const readConstantLoop = (
  tokens: readonly GoToken[],
  forPosition: number,
  resolveName: (name: string) => GoValue | undefined,
  resolveBoundName: (name: string) => GoValue | undefined,
): ConstantLoop | undefined => {
  const rangeLoop = readRangeLoop(tokens, forPosition, resolveName);
  if (rangeLoop !== undefined) return rangeLoop;
  const sliceLoop = readSliceRangeLoop(tokens, forPosition, resolveName);
  if (sliceLoop !== undefined) return sliceLoop;
  const variable = tokens[forPosition + 1];
  if (variable?.kind !== GoTokenKind.Identifier || !checkIsGoPunctuation(tokens[forPosition + 2], ":="))
    return undefined;
  const start = parseGoExpression(tokens, forPosition + 3, true);
  if (
    !checkIsGoPunctuation(tokens[start.end], ";") ||
    tokens[start.end + 1]?.text !== variable.text ||
    !(checkIsGoPunctuation(tokens[start.end + 2], "<") || checkIsGoPunctuation(tokens[start.end + 2], "<="))
  )
    return undefined;
  const isBoundInclusive = checkIsGoPunctuation(tokens[start.end + 2], "<=");
  const bound = parseGoExpression(tokens, start.end + 3, true);
  const stepStart = bound.end + 1;
  if (!checkIsGoPunctuation(tokens[bound.end], ";") || tokens[stepStart]?.text !== variable.text) return undefined;
  // `i++` steps by one, `i += 90` by its expression
  const isIncrement = checkIsGoPunctuation(tokens[stepStart + 1], "++");
  const isAddAssign =
    checkIsGoPunctuation(tokens[stepStart + 1], "+") && checkIsGoPunctuation(tokens[stepStart + 2], "=");
  if (!isIncrement && !isAddAssign) return undefined;
  const step = isIncrement ? undefined : parseGoExpression(tokens, stepStart + 3, true);
  const stepEnd = step === undefined ? stepStart + 2 : step.end;
  if (!checkIsGoPunctuation(tokens[stepEnd], "{")) return undefined;
  const startValue = evaluateGoNumber(start.expression, resolveName);
  const boundValue = evaluateGoNumber(bound.expression, resolveBoundName);
  const stepValue = step === undefined ? 1 : evaluateGoNumber(step.expression, resolveName);
  if (typeof startValue !== "number" || typeof boundValue !== "number" || (stepValue !== undefined && stepValue <= 0))
    return undefined;
  const isRunning = (value: number): boolean => (isBoundInclusive ? value <= boundValue : value < boundValue);
  const values: number[] = [];
  if (stepValue !== undefined)
    for (let value = startValue; isRunning(value); value += stepValue) {
      if (values.length === GO_MAX_LOOP_ITERATIONS) return undefined;
      values.push(value);
    }
  else if (isRunning(startValue)) values.push(startValue);

  const bodyEnd = findClosing(tokens, stepEnd, "{", "}");
  return bodyEnd === undefined
    ? undefined
    : { bodyEnd, bodyStart: stepEnd, iterations: values.map((value) => new Map([[variable.text, value]])) };
};
