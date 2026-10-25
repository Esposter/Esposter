import type { CallTiming } from "#src/models/genshinAssets/kits/gcsim/CallTiming";
import type { ConstantLoop } from "#src/models/genshinAssets/kits/gcsim/ConstantLoop";
import type { GoScope } from "#src/models/genshinAssets/kits/gcsim/GoScope";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { TaskClosure } from "#src/models/genshinAssets/kits/gcsim/TaskClosure";

import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readIterations } from "#src/services/genshinAssets/kits/gcsim/readIterations";
import { readTaskArgumentDelayStart } from "#src/services/genshinAssets/kits/gcsim/readTaskArgumentDelayStart";
import { sumOptionalDelays } from "#src/services/genshinAssets/kits/gcsim/sumOptionalDelays";

// The delay one call of a method adds, from the `Tasks.Add` or `QueueCharTask` closures around the call, once per
// Iteration of the constant loops and parameter values it is in. A call in no closure adds none
export const readCallSiteDelays = (
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
      const closureDelay = sumOptionalDelays(
        closureDelayExpressions.map((expression) => evaluateGoNumber(expression, resolveIteration)),
      );
      // A `Tasks.Add` delay the reader cannot evaluate gives the call its own delay alone, as a call it reads no delay for
      const argumentDelay =
        argumentDelayExpression === undefined ? undefined : evaluateGoNumber(argumentDelayExpression, resolveIteration);
      if (argumentDelayStart !== undefined && argumentDelay !== undefined)
        return {
          delay: closureDelay === undefined ? undefined : closureDelay + argumentDelay,
          line: tokens[argumentDelayStart]?.line,
        };
      return {
        delay: isReturned ? undefined : closureDelay,
        line: firstTask === undefined ? undefined : tokens[firstTask.delayStart]?.line,
      };
    });
};
