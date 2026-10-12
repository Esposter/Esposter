import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readArgumentStarts } from "#src/services/genshinAssets/kits/gcsim/readArgumentStarts";
import { readGoHitbox } from "#src/services/genshinAssets/kits/gcsim/readGoHitbox";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

const QUEUE_CALLEES = new Set(["QueueAttack", "QueueAttackWithSnap"]);
// The damage delay's place among a queue call's arguments, the fourth in both of them
const DELAY_ARGUMENT_INDEX = 3;
// The attack pattern's place among a queue call's arguments, the second, or the third in `QueueAttackWithSnap`
const HITBOX_ARGUMENT_INDEX_MAP = new Map([
  ["QueueAttack", 1],
  ["QueueAttackWithSnap", 2],
]);
// The most iterations a constant loop may take before its calls are read once, as a loop too long to expand
const MAX_LOOP_ITERATIONS = 100;

// A `for` loop of constant bounds, `for delay := burstStart; delay < 12*60+burstStart; delay += 90 {`, its variable's
// Values and the braces of its body
interface ConstantLoop {
  bodyEnd: number;
  bodyStart: number;
  values: number[];
  variable: string;
}

// The position of the `AttackInfo` literal an argument begins with, `info.AttackInfo{` or `combat.AttackInfo{`, else
// Undefined
const findInlineAttackPosition = (tokens: readonly GoToken[], start: number): number | undefined => {
  let position = start;
  while (checkIsGoPunctuation(tokens[position + 1], ".") && tokens[position + 2]?.kind === GoTokenKind.Identifier)
    position += 2;
  return tokens[position]?.text === "AttackInfo" && checkIsGoPunctuation(tokens[position + 1], "{")
    ? position
    : undefined;
};

// The name a call's first argument passes its `AttackInfo` by, the last segment of `ai`, `c.skillAttackInfo` or
// `c.a1AttackInfo()`
const getPassedName = (expression: GoExpression): string | undefined => {
  if (expression.kind === GoExpressionKind.Identifier) return expression.name.split(".").at(-1);
  else if (expression.kind === GoExpressionKind.Call) return expression.callee.split(".").at(-1);
  else return undefined;
};

// The numbers a file's locals are first given with `:=`, `windup := 0`, which a delay written in terms of a local reads, as
// The local is its first value before a branch of the function changes it. A local its declaration gives no number, a
// `travel, ok := p["travel"]`, takes the first number it is assigned, a constant or a literal, `travel = 5` or
// `travel = tickTravel` in the branch that defaults it
const readLocalNumberMap = (
  tokens: readonly GoToken[],
  constantMap: ReadonlyMap<string, GoConstant>,
): Map<string, number> => {
  const localNumberMap = new Map<string, number>();
  for (const [position, token] of tokens.entries()) {
    const value = tokens[position + 2];
    if (
      token.kind === GoTokenKind.Identifier &&
      checkIsGoPunctuation(tokens[position + 1], ":=") &&
      value?.kind === GoTokenKind.Number &&
      !localNumberMap.has(token.text)
    )
      localNumberMap.set(token.text, Number(value.text.replaceAll("_", "")));
  }
  for (const [position, token] of tokens.entries()) {
    const value = tokens[position + 2];
    const number =
      value?.kind === GoTokenKind.Number
        ? Number(value.text.replaceAll("_", ""))
        : value?.kind === GoTokenKind.Identifier
          ? constantMap.get(value.text)?.value
          : undefined;
    if (
      token.kind === GoTokenKind.Identifier &&
      checkIsGoPunctuation(tokens[position + 1], "=") &&
      !checkIsGoPunctuation(tokens[position - 1], ".") &&
      typeof number === "number" &&
      !localNumberMap.has(token.text)
    )
      localNumberMap.set(token.text, number);
  }
  return localNumberMap;
};

// The position of the brace closing the one opening at the position, else Undefined
const findClosingBrace = (tokens: readonly GoToken[], openingPosition: number): number | undefined => {
  let depth = 0;
  for (let position = openingPosition; position < tokens.length; position++)
    if (checkIsGoPunctuation(tokens[position], "{")) depth++;
    else if (checkIsGoPunctuation(tokens[position], "}") && --depth === 0) return position;
  return undefined;
};

// The `for` loop opening at the position when it counts a variable from a constant start up to a constant bound in
// Constant steps, its values and its body's braces, else Undefined
const readConstantLoop = (
  tokens: readonly GoToken[],
  forPosition: number,
  resolveName: (name: string) => GoValue | undefined,
): ConstantLoop | undefined => {
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
  const startValue = evaluateGoExpression(start.expression, resolveName);
  const boundValue = evaluateGoExpression(bound.expression, resolveName);
  const stepValue = step === undefined ? 1 : evaluateGoExpression(step.expression, resolveName);
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
  return bodyEnd === undefined ? undefined : { bodyEnd, bodyStart: stepEnd, values, variable: variable.text };
};

// Each constant loop of a file, read at its `for` keyword
const readConstantLoops = (
  tokens: readonly GoToken[],
  resolveName: (name: string) => GoValue | undefined,
): ConstantLoop[] => {
  const loops: ConstantLoop[] = [];
  for (const [position, token] of tokens.entries()) {
    if (token.kind !== GoTokenKind.Identifier || token.text !== "for") continue;
    const loop = readConstantLoop(tokens, position, resolveName);
    if (loop !== undefined) loops.push(loop);
  }
  return loops;
};

// The variable values of every iteration a position is in, one map each, of its enclosing constant loops taken together
const readIterations = (loops: readonly ConstantLoop[], position: number): Map<string, number>[] =>
  loops
    .filter(({ bodyEnd, bodyStart }) => bodyStart < position && position < bodyEnd)
    .reduce<Map<string, number>[]>(
      (iterations, { values, variable }) =>
        iterations.flatMap((iteration) => values.map((value) => new Map(iteration).set(variable, value))),
      [new Map()],
    );

// Each `QueueAttack` and `QueueAttackWithSnap` call of a gcsim character's action files, its `AttackInfo` read from its
// Inline literal or from the name it passes, and its damage delay read as the fourth argument, where the constants, the
// Locals' first numbers and literal numbers give it a value. A call in a loop of constant bounds is read once per
// Iteration, its delay with the loop's variable taking that iteration's value
export const readGcsimQueuedAttacks = (
  sources: readonly GoSource[],
  constantMap: ReadonlyMap<string, GoConstant>,
): GcsimQueuedAttack[] =>
  sources.flatMap(({ path: file, source }) => {
    const tokens = tokenizeGo(source);
    const localNumberMap = readLocalNumberMap(tokens, constantMap);
    const resolveName = (name: string) => constantMap.get(name)?.value ?? localNumberMap.get(name);
    const loops = readConstantLoops(tokens, resolveName);
    const queuedAttacks: GcsimQueuedAttack[] = [];
    for (const [position, token] of tokens.entries()) {
      if (token.kind !== GoTokenKind.Identifier || !QUEUE_CALLEES.has(token.text)) continue;
      if (!checkIsGoPunctuation(tokens[position + 1], "(")) continue;
      const argumentStarts = readArgumentStarts(tokens, position + 1);
      const [attackStart, delayStart] = [argumentStarts[0], argumentStarts[DELAY_ARGUMENT_INDEX]];
      if (attackStart === undefined) continue;
      const inlineAttackPosition = findInlineAttackPosition(tokens, attackStart);
      const delayExpression = delayStart === undefined ? undefined : parseGoExpression(tokens, delayStart).expression;
      const hitboxStart = argumentStarts[HITBOX_ARGUMENT_INDEX_MAP.get(token.text) ?? -1];
      const hitbox = hitboxStart === undefined ? undefined : readGoHitbox(tokens, hitboxStart, resolveName, file);
      const attackLine = inlineAttackPosition === undefined ? undefined : tokens[inlineAttackPosition]?.line;
      const attackName =
        inlineAttackPosition === undefined
          ? getPassedName(parseGoExpression(tokens, attackStart).expression)
          : undefined;
      for (const iteration of readIterations(loops, position)) {
        const resolveIteration = (name: string) => iteration.get(name) ?? resolveName(name);
        const delayValue =
          delayExpression === undefined ? undefined : evaluateGoExpression(delayExpression, resolveIteration);
        queuedAttacks.push({
          attackLine,
          attackName,
          delay: typeof delayValue === "number" ? delayValue : undefined,
          delayLine: tokens[delayStart ?? position]?.line ?? token.line,
          file,
          hitbox,
          line: token.line,
        });
      }
    }
    return queuedAttacks;
  });
