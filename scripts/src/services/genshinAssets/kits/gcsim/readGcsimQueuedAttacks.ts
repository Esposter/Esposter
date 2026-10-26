import type { CallVariant } from "#src/models/genshinAssets/kits/gcsim/CallVariant";
import type { GcsimConfig } from "#src/models/genshinAssets/kits/gcsim/GcsimConfig";
import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsAfterTakenReturn } from "#src/services/genshinAssets/kits/gcsim/checkIsAfterTakenReturn";
import { SINGLE_TARGET_HIT_CONSTRUCTOR } from "#src/services/genshinAssets/kits/gcsim/constants";
import { createGoScope } from "#src/services/genshinAssets/kits/gcsim/createGoScope";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { findInlineAttackPosition } from "#src/services/genshinAssets/kits/gcsim/findInlineAttackPosition";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readCallVariants } from "#src/services/genshinAssets/kits/gcsim/readCallVariants";
import { readEnemyQueryLoops } from "#src/services/genshinAssets/kits/gcsim/readEnemyQueryLoops";
import { readConstantLoops } from "#src/services/genshinAssets/kits/gcsim/readGoConstantLoops";
import { readGoEnclosingFunction } from "#src/services/genshinAssets/kits/gcsim/readGoEnclosingFunction";
import { readGoHitbox } from "#src/services/genshinAssets/kits/gcsim/readGoHitbox";
import { readGoMethodCallSites } from "#src/services/genshinAssets/kits/gcsim/readGoMethodCallSites";
import { readGoNamedFunctions } from "#src/services/genshinAssets/kits/gcsim/readGoNamedFunctions";
import { readHitboxStart } from "#src/services/genshinAssets/kits/gcsim/readHitboxStart";
import { readIterations } from "#src/services/genshinAssets/kits/gcsim/readIterations";
import { readPassedName } from "#src/services/genshinAssets/kits/gcsim/readPassedName";
import { readReturnedClosures } from "#src/services/genshinAssets/kits/gcsim/readReturnedClosures";
import { readReturnedConstellationGates } from "#src/services/genshinAssets/kits/gcsim/readReturnedConstellationGates";
import { readTaskClosures } from "#src/services/genshinAssets/kits/gcsim/readTaskClosures";
import { sumOptionalDelays } from "#src/services/genshinAssets/kits/gcsim/sumOptionalDelays";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

const QUEUE_CALLEES = new Set(["QueueAttack", "QueueAttackWithSnap"]);
// The damage delay's place among a queue call's arguments, the fourth in both of them
const DELAY_ARGUMENT_INDEX = 3;
// The attack pattern's place among a queue call's arguments, the second, or the third in `QueueAttackWithSnap`
const HITBOX_ARGUMENT_INDEX_MAP = new Map([
  ["QueueAttack", 1],
  ["QueueAttackWithSnap", 2],
]);

// Each `QueueAttack` and `QueueAttackWithSnap` call of a gcsim character's action files, its `AttackInfo` read from its
// Inline literal or from the name it passes, and its damage delay read as the fourth argument, where the constants and the
// Locals its own function gives one value resolve to a number (see `createGoScope`). A call in a loop of constant bounds
// Is read once per iteration, its delay with the loop's variable taking that iteration's value. A call in a `Tasks.Add` or
// `QueueCharTask` closure adds the closure's delay to its own, as the task runs its body at that delay. A loop's bound
// Reads the value a constellation gives it, the base kit's by default
export const readGcsimQueuedAttacks = (
  sources: readonly GoSource[],
  constantMap: ReadonlyMap<string, GoConstant>,
  config: GcsimConfig,
  constellation = 0,
): GcsimQueuedAttack[] =>
  sources.flatMap(({ path: file, source }) => {
    const tokens = tokenizeGo(source);
    const scope = createGoScope(tokens, constantMap);
    const loops = readConstantLoops(tokens, scope, config, constellation);
    const taskClosures = readTaskClosures(tokens);
    const enemyQueryLoops = readEnemyQueryLoops(tokens, scope, file);
    const returnedClosures = readReturnedClosures(tokens);
    const namedFunctions = readGoNamedFunctions(tokens);
    // A return a constellation block gives ends the code after it in a task closure, which is delayed as a whole
    const returnedGates = readReturnedConstellationGates(tokens).filter(({ scopeEnd, scopeStart }) =>
      taskClosures.some(({ bodyEnd, bodyStart }) => bodyStart === scopeStart && bodyEnd === scopeEnd),
    );
    const queuedAttacks: GcsimQueuedAttack[] = [];
    for (const [position, token] of tokens.entries()) {
      if (token.kind !== GoTokenKind.Identifier || !QUEUE_CALLEES.has(token.text)) continue;
      // A call a task's constellation return ends the code before is not reached at that constellation
      if (checkIsAfterTakenReturn(position, returnedGates, constellation)) continue;
      const { end: callEnd, expression: call } = parseGoExpression(tokens, position);
      if (call.kind !== GoExpressionKind.Call) continue;
      const argumentStarts = call.parameterStarts;
      const [attackStart, delayStart] = [argumentStarts[0], argumentStarts[DELAY_ARGUMENT_INDEX]];
      if (attackStart === undefined) continue;
      const inlineAttackPosition = findInlineAttackPosition(tokens, attackStart);
      const delayExpression = delayStart === undefined ? undefined : parseGoExpression(tokens, delayStart).expression;
      const hitboxStart = argumentStarts[HITBOX_ARGUMENT_INDEX_MAP.get(token.text) ?? -1];
      const hitboxValueStart =
        hitboxStart === undefined ? undefined : readHitboxStart(tokens, hitboxStart, position, scope);
      // A single-target hit fired in the innermost area query's loop takes that query's area, as it lands on each enemy in it
      const queryHitbox = enemyQueryLoops.findLast(
        ({ bodyEnd, bodyStart }) => bodyStart < position && position < bodyEnd,
      )?.hitbox;
      const attackLine = inlineAttackPosition === undefined ? undefined : tokens[inlineAttackPosition]?.line;
      const attackName =
        inlineAttackPosition === undefined ? readPassedName(tokens, namedFunctions, attackStart, position) : undefined;
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
      const loopIterations = readIterations(loops, position);
      for (const callVariant of callVariants)
        for (const loopIteration of loopIterations) {
          const iteration = new Map([...loopIteration, ...callVariant.parameters]);
          const resolveIteration = (name: string) =>
            iteration.get(name) ?? scope.resolveName(name, position, iteration);
          // The hitbox's numbers resolve through the iteration as the delay's do, so a loop's hit takes its own radius
          const ownHitbox =
            hitboxValueStart === undefined
              ? undefined
              : readGoHitbox(tokens, hitboxValueStart, resolveIteration, file, (name) =>
                  scope.resolveAssignment(name, position),
                );
          const hitbox =
            ownHitbox?.name === SINGLE_TARGET_HIT_CONSTRUCTOR && queryHitbox !== undefined ? queryHitbox : ownHitbox;
          const delay = sumOptionalDelays(
            [delayExpression, ...taskDelayExpressions].map((expression) =>
              expression === undefined ? undefined : evaluateGoNumber(expression, resolveIteration),
            ),
          );
          const holdValue = iteration.get("hold");
          queuedAttacks.push({
            attackLine,
            attackName,
            delay: delay === undefined || callVariant.delay === undefined ? undefined : delay + callVariant.delay,
            delayLine: callVariant.line ?? tokens[firstTask?.delayStart ?? delayStart ?? position]?.line ?? token.line,
            file,
            hitbox,
            ...(iteration.size > 0 && { iterations: Object.fromEntries(iteration) }),
            lastLine: tokens[callEnd - 1]?.line ?? token.line,
            line: token.line,
            ...(holdValue !== undefined && { holdValue }),
          });
        }
    }
    return queuedAttacks;
  });
