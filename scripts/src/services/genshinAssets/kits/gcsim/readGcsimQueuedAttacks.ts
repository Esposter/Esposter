import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { ConstantLoop } from "#src/services/genshinAssets/kits/gcsim/readGoConstantLoops";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { createGoScope } from "#src/services/genshinAssets/kits/gcsim/createGoScope";
import { readGoHitbox } from "#src/services/genshinAssets/kits/gcsim/readGoHitbox";
import { findClosingBrace, readConstantLoops } from "#src/services/genshinAssets/kits/gcsim/readGoConstantLoops";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

const QUEUE_CALLEES = new Set(["QueueAttack", "QueueAttackWithSnap"]);
// The damage delay's place among a queue call's arguments, the fourth in both of them
const DELAY_ARGUMENT_INDEX = 3;
// The attack pattern's place among a queue call's arguments, the second, or the third in `QueueAttackWithSnap`
const HITBOX_ARGUMENT_INDEX_MAP = new Map([
  ["QueueAttack", 1],
  ["QueueAttackWithSnap", 2],
]);
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

// A `Tasks.Add` or `QueueCharTask` closure's body and the delay written after it, `c.Core.Tasks.Add(func() {` ... `}, delay)`: the task runs
// Its body that delay after the action, so a queue call in the body is delayed by it as well
interface TaskClosure {
  bodyEnd: number;
  bodyStart: number;
  delayStart: number;
}

// Each `Tasks.Add` or `QueueCharTask` closure of a file, read at its `Tasks` or `QueueCharTask` token
const readTaskClosures = (tokens: readonly GoToken[]): TaskClosure[] => {
  const closures: TaskClosure[] = [];
  for (const [position, token] of tokens.entries()) {
    if (token.kind !== GoTokenKind.Identifier) continue;
    const funcStart =
      token.text === "Tasks" &&
      checkIsGoPunctuation(tokens[position + 1], ".") &&
      tokens[position + 2]?.text === "Add" &&
      checkIsGoPunctuation(tokens[position + 3], "(")
        ? position + 4
        : token.text === "QueueCharTask" && checkIsGoPunctuation(tokens[position + 1], "(")
          ? position + 2
          : undefined;
    if (funcStart === undefined) continue;
    const bodyStart = funcStart + 3;
    const isClosure =
      tokens[funcStart]?.text === "func" &&
      checkIsGoPunctuation(tokens[funcStart + 1], "(") &&
      checkIsGoPunctuation(tokens[funcStart + 2], ")") &&
      checkIsGoPunctuation(tokens[bodyStart], "{");
    const bodyEnd = isClosure ? findClosingBrace(tokens, bodyStart) : undefined;
    if (bodyEnd === undefined || !checkIsGoPunctuation(tokens[bodyEnd + 1], ",")) continue;
    closures.push({ bodyEnd, bodyStart, delayStart: bodyEnd + 2 });
  }
  return closures;
};

// The variable values of every iteration a position is in, one map each, of its enclosing constant loops taken together
const readIterations = (loops: readonly ConstantLoop[], position: number): Map<string, number>[] =>
  loops
    .filter(({ bodyEnd, bodyStart }) => bodyStart < position && position < bodyEnd)
    .reduce<Map<string, number>[]>(
      (iterations, { iterations: loopIterations }) =>
        iterations.flatMap((iteration) =>
          loopIterations.map((loopIteration) => new Map([...iteration, ...loopIteration])),
        ),
      [new Map()],
    );

// Each `QueueAttack` and `QueueAttackWithSnap` call of a gcsim character's action files, its `AttackInfo` read from its
// Inline literal or from the name it passes, and its damage delay read as the fourth argument, where the constants and the
// Locals its own function gives one value resolve to a number (see `createGoScope`). A call in a loop of constant bounds
// Is read once per iteration, its delay with the loop's variable taking that iteration's value. A call in a `Tasks.Add` or
// `QueueCharTask` closure adds the closure's delay to its own, as the task runs its body at that delay
export const readGcsimQueuedAttacks = (
  sources: readonly GoSource[],
  constantMap: ReadonlyMap<string, GoConstant>,
): GcsimQueuedAttack[] =>
  sources.flatMap(({ path: file, source }) => {
    const tokens = tokenizeGo(source);
    const scope = createGoScope(tokens, constantMap);
    const loops = readConstantLoops(tokens, scope);
    const taskClosures = readTaskClosures(tokens);
    const queuedAttacks: GcsimQueuedAttack[] = [];
    for (const [position, token] of tokens.entries()) {
      if (token.kind !== GoTokenKind.Identifier || !QUEUE_CALLEES.has(token.text)) continue;
      const call = parseGoExpression(tokens, position).expression;
      if (call.kind !== GoExpressionKind.Call) continue;
      const argumentStarts = call.parameterStarts;
      const [attackStart, delayStart] = [argumentStarts[0], argumentStarts[DELAY_ARGUMENT_INDEX]];
      if (attackStart === undefined) continue;
      const inlineAttackPosition = findInlineAttackPosition(tokens, attackStart);
      const delayExpression = delayStart === undefined ? undefined : parseGoExpression(tokens, delayStart).expression;
      const hitboxStart = argumentStarts[HITBOX_ARGUMENT_INDEX_MAP.get(token.text) ?? -1];
      const hitbox =
        hitboxStart === undefined
          ? undefined
          : readGoHitbox(tokens, hitboxStart, (name) => scope.resolveName(name, position), file);
      const attackLine = inlineAttackPosition === undefined ? undefined : tokens[inlineAttackPosition]?.line;
      const attackName =
        inlineAttackPosition === undefined
          ? getPassedName(parseGoExpression(tokens, attackStart).expression)
          : undefined;
      const enclosingTasks = taskClosures.filter(
        ({ bodyEnd, bodyStart }) => bodyStart < position && position < bodyEnd,
      );
      const taskDelayExpressions = enclosingTasks.map(
        ({ delayStart }) => parseGoExpression(tokens, delayStart).expression,
      );
      const [firstTask] = enclosingTasks;
      const parameterIterations = scope.readParameterIterations(position);
      for (const iteration of readIterations(loops, position).flatMap((loopIteration) =>
        parameterIterations.map((parameterIteration) => new Map([...loopIteration, ...parameterIteration])),
      )) {
        const resolveIteration = (name: string) => iteration.get(name) ?? scope.resolveName(name, position);
        const delayValues = [delayExpression, ...taskDelayExpressions].map((expression) =>
          expression === undefined ? undefined : evaluateGoNumber(expression, resolveIteration),
        );
        const delay = delayValues.reduce<number | undefined>(
          (sum, value) => (sum === undefined || value === undefined ? undefined : sum + value),
          0,
        );
        queuedAttacks.push({
          attackLine,
          attackName,
          delay,
          delayLine: tokens[firstTask?.delayStart ?? delayStart ?? position]?.line ?? token.line,
          file,
          hitbox,
          ...(iteration.size > 0 && { iterations: Object.fromEntries(iteration) }),
          line: token.line,
        });
      }
    }
    return queuedAttacks;
  });
