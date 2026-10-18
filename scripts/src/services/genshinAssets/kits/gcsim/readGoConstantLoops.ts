import type { createGoScope } from "#src/services/genshinAssets/kits/gcsim/createGoScope";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

// The most iterations a constant loop may take before its calls are read once, as a loop too long to expand
const MAX_LOOP_ITERATIONS = 100;

type GoScope = ReturnType<typeof createGoScope>;

// A `for` loop of constant bounds, `for delay := burstStart; delay < 12*60+burstStart; delay += 90 {`, or over a constant
// Slice, `for i, delay := range burstHitmarks {`, its iterations' variable values and the braces of its body
export interface ConstantLoop {
  bodyEnd: number;
  bodyStart: number;
  iterations: Map<string, number>[];
}

// The position of the brace closing the one opening at the position, else Undefined
export const findClosingBrace = (tokens: readonly GoToken[], openingPosition: number): number | undefined => {
  let depth = 0;
  for (let position = openingPosition; position < tokens.length; position++)
    if (checkIsGoPunctuation(tokens[position], "{")) depth++;
    else if (checkIsGoPunctuation(tokens[position], "}") && --depth === 0) return position;
  return undefined;
};

// The `for` loop opening at the position when it ranges over a constant count, `for i := range 19 {` or `for range 2 {`,
// Its values the counts from zero, and its body's braces, else Undefined
const readRangeLoop = (
  tokens: readonly GoToken[],
  forPosition: number,
  resolveName: (name: string) => GoValue | undefined,
): ConstantLoop | undefined => {
  const isNamed = checkIsGoPunctuation(tokens[forPosition + 2], ":=") && tokens[forPosition + 3]?.text === "range";
  const variable = isNamed ? tokens[forPosition + 1] : undefined;
  if (isNamed ? variable?.kind !== GoTokenKind.Identifier : tokens[forPosition + 1]?.text !== "range") return undefined;
  const boundStart = forPosition + (isNamed ? 4 : 2);
  const bound = parseGoExpression(tokens, boundStart);
  const boundValue = evaluateGoNumber(bound.expression, resolveName);
  if (
    !checkIsGoPunctuation(tokens[bound.end], "{") ||
    typeof boundValue !== "number" ||
    boundValue > MAX_LOOP_ITERATIONS
  )
    return undefined;
  const bodyEnd = findClosingBrace(tokens, bound.end);
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

// The `for` loop opening at the position when it ranges over a constant slice, `for i, delay := range burstHitmarks {`,
// Its iterations the slice's indexes and elements, and its body's braces, else Undefined
const readSliceRangeLoop = (
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
    slice.length > MAX_LOOP_ITERATIONS ||
    !slice.every((element) => typeof element === "number")
  )
    return undefined;
  const bodyEnd = findClosingBrace(tokens, bodyStart);
  return bodyEnd === undefined
    ? undefined
    : {
        bodyEnd,
        bodyStart,
        iterations: slice.map(
          (element, index) =>
            new Map<string, number>([
              [indexToken.text, index],
              [valueToken.text, element],
            ]),
        ),
      };
};

// The `for` loop opening at the position when it counts a variable from a constant start up to a constant bound in
// Constant steps, its values and its body's braces, else Undefined
const readConstantLoop = (
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
    if (values.length === MAX_LOOP_ITERATIONS) return undefined;
    values.push(value);
  }
  const bodyEnd = findClosingBrace(tokens, stepEnd);
  return bodyEnd === undefined
    ? undefined
    : { bodyEnd, bodyStart: stepEnd, iterations: values.map((value) => new Map([[variable.text, value]])) };
};

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
