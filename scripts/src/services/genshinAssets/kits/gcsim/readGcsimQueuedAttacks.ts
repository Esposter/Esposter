import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { ConstantLoop, GoScope } from "#src/services/genshinAssets/kits/gcsim/readGoConstantLoops";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { createGoScope } from "#src/services/genshinAssets/kits/gcsim/createGoScope";
import {
  readGoHitbox,
  readGoStruckEnemyHitbox,
  SINGLE_TARGET_HIT_CONSTRUCTOR,
} from "#src/services/genshinAssets/kits/gcsim/readGoHitbox";
import {
  findClosingParenthesis,
  readGoEnclosingFunction,
  readGoMethodCallSites,
  readGoNamedFunctions,
} from "#src/services/genshinAssets/kits/gcsim/readGoNamedFunctions";
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
// The delay a call of a method adds to the queue calls it runs, from the closures it is in, and the line of the
// Innermost one's delay. A call outside every closure adds none, and has no line
interface CallTiming {
  delay: number | undefined;
  line?: number;
}
// One way a method's queue call is run, by one call of the method: the delay its call adds, and the values its call
// Gives the method's parameters
interface CallVariant extends CallTiming {
  parameters: Map<string, number>;
}

// The position a queue call's attack pattern is read from: the argument itself, or where its bare local was assigned in
// The call's own function, as `ap := combat.NewCircleHitOnTarget(...)` is passed as `ap`, else none
const readHitboxStart = (
  tokens: readonly GoToken[],
  start: number,
  position: number,
  scope: GoScope,
): number | undefined => {
  const expression = parseGoExpression(tokens, start).expression;
  return expression.kind === GoExpressionKind.Identifier ? scope.resolveAssignment(expression.name, position) : start;
};

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

// The sets of values a method's parameters take at one call of it: each argument gives a number at the call's position,
// Or two where it is a local the clamp of the action's hold bounds to 0 and 1, so the call is one set per value
const readCallParameters = (
  tokens: readonly GoToken[],
  scope: GoScope,
  site: number,
  parameters: readonly string[],
): Map<string, number>[] => {
  const call = parseGoExpression(tokens, site).expression;
  if (call.kind !== GoExpressionKind.Call) return [new Map()];
  return parameters.reduce<Map<string, number>[]>(
    (iterations, name, index) => {
      const argumentStart = call.parameterStarts[index];
      const values = argumentStart === undefined ? undefined : scope.readArgumentValues(site, argumentStart);
      if (values === undefined) return iterations;
      return iterations.flatMap((iteration) => values.map((value) => new Map(iteration).set(name, value)));
    },
    [new Map()],
  );
};

// The delay a method's call gives when it is the function a `Tasks.Add` runs, `c.Core.Tasks.Add(c.burstTick(), 137)`, read
// From its receiver through the call to the delay after its comma, else undefined
const readTaskArgumentDelayStart = (tokens: readonly GoToken[], site: number): number | undefined => {
  const receiver = site - 2;
  const isTaskAdd =
    checkIsGoPunctuation(tokens[site - 1], ".") &&
    checkIsGoPunctuation(tokens[receiver - 1], "(") &&
    tokens[receiver - 2]?.text === "Add" &&
    checkIsGoPunctuation(tokens[receiver - 3], ".") &&
    tokens[receiver - 4]?.text === "Tasks";
  if (!isTaskAdd) return undefined;
  const callEnd = parseGoExpression(tokens, receiver).end;
  return checkIsGoPunctuation(tokens[callEnd], ",") ? callEnd + 1 : undefined;
};

// A closure a function returns, `return func(a info.AttackCB) {` ... `}`, runs where the value it returns is called, so a
// Queue call in it takes the delay of the call that schedules that value, or none where no call schedules it
interface ReturnedClosure {
  bodyEnd: number;
  bodyStart: number;
}

// Each closure a function returns in a file, read at its `return` token
const readReturnedClosures = (tokens: readonly GoToken[]): ReturnedClosure[] =>
  tokens.flatMap((token, position) => {
    if (
      token.text !== "return" ||
      tokens[position + 1]?.text !== "func" ||
      !checkIsGoPunctuation(tokens[position + 2], "(")
    )
      return [];
    const parametersEnd = findClosingParenthesis(tokens, position + 2);
    if (parametersEnd === undefined || !checkIsGoPunctuation(tokens[parametersEnd + 1], "{")) return [];
    const bodyEnd = findClosingBrace(tokens, parametersEnd + 1);
    return bodyEnd === undefined ? [] : [{ bodyEnd, bodyStart: parametersEnd + 1 }];
  });

// The delay one call of a method adds, from the `Tasks.Add` or `QueueCharTask` closures around the call, once per
// Iteration of the constant loops and parameter values it is in. A call in no closure adds none
const readCallSiteDelays = (
  tokens: readonly GoToken[],
  scope: GoScope,
  loops: readonly ConstantLoop[],
  taskClosures: readonly TaskClosure[],
  site: number,
  isReturned: boolean,
): CallTiming[] => {
  const siteTasks = taskClosures.filter(({ bodyEnd, bodyStart }) => bodyStart < site && site < bodyEnd);
  const argumentDelayStart = readTaskArgumentDelayStart(tokens, site);
  // A returned closure runs only where its value is scheduled, so a call that schedules none, as a callback does, has none
  if (isReturned && argumentDelayStart === undefined) return [{ delay: undefined }];
  if (siteTasks.length === 0 && argumentDelayStart === undefined) return [{ delay: 0 }];
  const closureDelayExpressions = siteTasks.map(({ delayStart }) => parseGoExpression(tokens, delayStart).expression);
  const argumentDelayExpression =
    argumentDelayStart === undefined ? undefined : parseGoExpression(tokens, argumentDelayStart).expression;
  const [firstTask] = siteTasks;
  const parameterIterations = scope.readParameterIterations(site);
  return readIterations(loops, site)
    .flatMap((loopIteration) =>
      parameterIterations.map((parameterIteration) => new Map([...loopIteration, ...parameterIteration])),
    )
    .map((iteration) => {
      const resolveIteration = (name: string) => iteration.get(name) ?? scope.resolveName(name, site);
      const closureDelay = closureDelayExpressions
        .map((expression) => evaluateGoNumber(expression, resolveIteration))
        .reduce<number | undefined>(
          (sum, value) => (sum === undefined || value === undefined ? undefined : sum + value),
          0,
        );
      // A `Tasks.Add` delay the reader cannot evaluate gives the call its own delay alone, as a call it reads no delay for
      const argumentDelay =
        argumentDelayExpression === undefined ? undefined : evaluateGoNumber(argumentDelayExpression, resolveIteration);
      if (argumentDelay !== undefined)
        return {
          delay: closureDelay === undefined ? undefined : closureDelay + argumentDelay,
          line: tokens[argumentDelayStart ?? site]?.line,
        };
      return {
        delay: isReturned ? undefined : closureDelay,
        line: firstTask === undefined ? undefined : tokens[firstTask.delayStart]?.line,
      };
    });
};

// The ways a method's queue call is run by the calls made of the method in this file, each call's parameter values and
// The delay its closures add, one variant per distinct pair
const readCallVariants = (
  tokens: readonly GoToken[],
  scope: GoScope,
  loops: readonly ConstantLoop[],
  taskClosures: readonly TaskClosure[],
  sites: readonly number[],
  parameters: readonly string[],
  isReturned: boolean,
): CallVariant[] => {
  const variants = new Map<string, CallVariant>();
  for (const site of sites) {
    const callParameterSets = readCallParameters(tokens, scope, site, parameters);
    for (const { delay, line } of readCallSiteDelays(tokens, scope, loops, taskClosures, site, isReturned))
      for (const callParameters of callParameterSets)
        variants.set(JSON.stringify([delay, line, [...callParameters]]), { delay, line, parameters: callParameters });
  }
  return [...variants.values()];
};

// The callee of an area query whose enemies a loop reads, `c.Core.Combat.EnemiesWithinArea(area, filter)`: a loop over
// Its enemies fires at each one in the area, so a single-target hit it fires lands on every enemy there. A random subset
// Of the area, `RandomEnemiesWithinArea`, reaches only some of them, so it is no such query
const ENEMIES_WITHIN_AREA_CALLEE = "EnemiesWithinArea";

// A loop over an area query's enemies, `for _, t := range targets {` with `targets` the query or the query written in
// Place: where its body starts and ends, and the hitbox of the area the query is made over, read where the query is written
interface EnemyQueryLoop {
  bodyEnd: number;
  bodyStart: number;
  hitbox: GcsimHitbox | undefined;
}

// The `{` a `range` header's expression is followed by, the first at no parenthesis depth so a `func` filter's own body
// Is passed over, else undefined
const readRangeBodyStart = (tokens: readonly GoToken[], start: number): number | undefined => {
  let depth = 0;
  for (let position = start; position < tokens.length; position++)
    if (checkIsGoPunctuation(tokens[position], "(")) depth++;
    else if (checkIsGoPunctuation(tokens[position], ")")) depth--;
    else if (depth === 0 && checkIsGoPunctuation(tokens[position], "{")) return position;
  return undefined;
};

// Each loop over an area query's enemies in a file, read at its `range` token
const readEnemyQueryLoops = (tokens: readonly GoToken[], scope: GoScope, file: string): EnemyQueryLoop[] =>
  tokens.flatMap((token, position) => {
    if (token.kind !== GoTokenKind.Identifier || token.text !== "range") return [];
    const bodyStart = readRangeBodyStart(tokens, position + 1);
    if (bodyStart === undefined) return [];
    // A bare local the loop ranges over, `range targets {`, is the query its assignment gives, else the query in place
    const isLocalRange =
      tokens[position + 1]?.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[position + 2], "{");
    const queryStart = isLocalRange
      ? scope.resolveAssignment(tokens[position + 1]?.text ?? "", position)
      : position + 1;
    if (queryStart === undefined) return [];
    const query = parseGoExpression(tokens, queryStart).expression;
    const bodyEnd = findClosingBrace(tokens, bodyStart);
    if (
      query.kind !== GoExpressionKind.Call ||
      query.callee.split(".").at(-1) !== ENEMIES_WITHIN_AREA_CALLEE ||
      bodyEnd === undefined
    )
      return [];
    const areaStart = query.parameterStarts[0];
    const areaValueStart = areaStart === undefined ? undefined : readHitboxStart(tokens, areaStart, queryStart, scope);
    return [
      {
        bodyEnd,
        bodyStart,
        hitbox:
          areaValueStart === undefined
            ? undefined
            : readGoHitbox(tokens, areaValueStart, (name) => scope.resolveName(name, queryStart), file),
      },
    ];
  });

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
    const enemyQueryLoops = readEnemyQueryLoops(tokens, scope, file);
    const returnedClosures = readReturnedClosures(tokens);
    const namedFunctions = readGoNamedFunctions(tokens);
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
      const hitboxValueStart =
        hitboxStart === undefined ? undefined : readHitboxStart(tokens, hitboxStart, position, scope);
      const ownHitbox =
        hitboxValueStart === undefined
          ? undefined
          : readGoHitbox(tokens, hitboxValueStart, (name) => scope.resolveName(name, position), file);
      // A single-target hit fired in the innermost area query's loop takes that query's area, as it lands on each enemy in it
      const queryHitbox = enemyQueryLoops.findLast(
        ({ bodyEnd, bodyStart }) => bodyStart < position && position < bodyEnd,
      )?.hitbox;
      const hitbox =
        ownHitbox?.name === SINGLE_TARGET_HIT_CONSTRUCTOR && queryHitbox !== undefined ? queryHitbox : ownHitbox;
      const struckEnemyHitbox =
        ownHitbox === undefined && hitboxValueStart !== undefined
          ? readGoStruckEnemyHitbox(tokens, hitboxValueStart, (name) => scope.resolveName(name, position), file)
          : undefined;
      const attackLine = inlineAttackPosition === undefined ? undefined : tokens[inlineAttackPosition]?.line;
      const attackName =
        inlineAttackPosition === undefined
          ? getPassedName(parseGoExpression(tokens, attackStart).expression)
          : undefined;
      const enclosingTasks = taskClosures.filter(
        ({ bodyEnd, bodyStart }) => bodyStart < position && position < bodyEnd,
      );
      const taskDelayExpressions = enclosingTasks.map((task) => parseGoExpression(tokens, task.delayStart).expression);
      const [firstTask] = enclosingTasks;
      const parameterIterations = scope.readParameterIterations(position);
      // A method's queue call runs once per call of the method, at the delay of the closures that call is in and with the
      // Parameter values it passes. A method never called in this file keeps its own delay and parameter values alone
      const enclosingFunction = readGoEnclosingFunction(namedFunctions, position);
      // A call from the method's own body is its next repeat, a tick's next, which is no call of the queue call anew
      const sites =
        enclosingFunction === undefined
          ? []
          : readGoMethodCallSites(tokens, enclosingFunction.name).filter(
              (site) => !(enclosingFunction.bodyStart < site && site < enclosingFunction.bodyEnd),
            );
      const isReturned = returnedClosures.some(({ bodyEnd, bodyStart }) => bodyStart < position && position < bodyEnd);
      const callVariants: CallVariant[] =
        enclosingFunction === undefined || sites.length === 0
          ? parameterIterations.map((parameters) => ({ delay: isReturned ? undefined : 0, parameters }))
          : readCallVariants(tokens, scope, loops, taskClosures, sites, enclosingFunction.parameters, isReturned);
      for (const callVariant of callVariants)
        for (const loopIteration of readIterations(loops, position)) {
          const iteration = new Map([...loopIteration, ...callVariant.parameters]);
          const resolveIteration = (name: string) => iteration.get(name) ?? scope.resolveName(name, position);
          const delayValues = [delayExpression, ...taskDelayExpressions].map((expression) =>
            expression === undefined ? undefined : evaluateGoNumber(expression, resolveIteration),
          );
          const delay = delayValues.reduce<number | undefined>(
            (sum, value) => (sum === undefined || value === undefined ? undefined : sum + value),
            0,
          );
          const holdValue = iteration.get("hold");
          queuedAttacks.push({
            attackLine,
            attackName,
            delay: delay === undefined || callVariant.delay === undefined ? undefined : delay + callVariant.delay,
            delayLine: callVariant.line ?? tokens[firstTask?.delayStart ?? delayStart ?? position]?.line ?? token.line,
            file,
            hitbox,
            ...(struckEnemyHitbox === undefined ? {} : { struckEnemyHitbox }),
            ...(iteration.size > 0 && { iterations: Object.fromEntries(iteration) }),
            line: token.line,
            ...(holdValue !== undefined && { holdValue }),
          });
        }
    }
    return queuedAttacks;
  });
