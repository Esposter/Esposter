import type { GoAssignment } from "#src/models/genshinAssets/kits/gcsim/GoAssignment";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";
import type { GoScope } from "#src/models/genshinAssets/kits/gcsim/GoScope";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { findAssignment } from "#src/services/genshinAssets/kits/gcsim/findAssignment";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readClampValues } from "#src/services/genshinAssets/kits/gcsim/readClampValues";
import { readGoEnclosingFunction } from "#src/services/genshinAssets/kits/gcsim/readGoEnclosingFunction";
import { readGoNamedFunctions } from "#src/services/genshinAssets/kits/gcsim/readGoNamedFunctions";

// How many calls a value is followed through, so a cycle of calls gives no value
const MAX_DEPTH = 4;

// The value of each name a Go source's references read at a position: a parameter's from its callers' arguments, a
// Local's from its dominating assignment, else a constant's. A name no assignment reaches, or a branch may skip, has none,
// So a local of another function is never read
export const createGoScope = (tokens: readonly GoToken[], constantMap: ReadonlyMap<string, GoConstant>): GoScope => {
  const nameCallPositionsMap = new Map<string, number[]>();
  for (const [position, token] of tokens.entries())
    if (token.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[position + 1], "(")) {
      const positions = nameCallPositionsMap.get(token.text) ?? [];
      positions.push(position);
      nameCallPositionsMap.set(token.text, positions);
    }
  const namedFunctions = readGoNamedFunctions(tokens);
  const findScope = (position: number): GoNamedFunction | undefined =>
    readGoEnclosingFunction(namedFunctions, position);

  // The values of an argument that is a local dominated by a clamp of the action's hold, read at its call's position
  const readClampedArgument = (argument: GoExpression, callPosition: number): number[] | undefined => {
    const scope = findScope(callPosition);
    if (argument.kind !== GoExpressionKind.Identifier || scope === undefined) return undefined;
    const assignment = findAssignment(tokens, scope, argument.name, callPosition, constantMap, undefined);
    return assignment.kind === "dominating"
      ? readClampValues(parseGoExpression(tokens, assignment.valueStart).expression)
      : undefined;
  };

  // Each number a function's parameter takes at its call sites, undefined where a call's argument has none
  const readParameterValues = (scope: GoNamedFunction, index: number, depth: number): number[] | undefined => {
    if (depth > MAX_DEPTH) return undefined;
    const callPositions = (nameCallPositionsMap.get(scope.name) ?? []).filter(
      (position) => position !== scope.nameIndex,
    );
    if (callPositions.length === 0) return undefined;
    const values = new Set<number>();
    for (const callPosition of callPositions) {
      const call = parseGoExpression(tokens, callPosition).expression;
      const argumentStart = call.kind === GoExpressionKind.Call ? call.parameterStarts[index] : undefined;
      if (argumentStart === undefined) return undefined;
      const argument = parseGoExpression(tokens, argumentStart).expression;
      const clampValues = readClampedArgument(argument, callPosition);
      if (clampValues !== undefined) {
        for (const clampValue of clampValues) values.add(clampValue);
        continue;
      }
      const value = evaluateGoNumber(argument, (name) => resolveAt(name, callPosition, depth + 1, undefined));
      if (value === undefined) return undefined;
      values.add(value);
    }
    return [...values];
  };

  const resolveAt = (
    name: string,
    position: number,
    depth: number,
    constellation: number | undefined,
    iteration?: ReadonlyMap<string, number>,
  ): GoValue | undefined => {
    if (depth > MAX_DEPTH) return undefined;
    const scope = findScope(position);
    const parameterIndex = scope?.parameters.indexOf(name) ?? -1;
    if (scope !== undefined && parameterIndex !== -1) {
      const values = readParameterValues(scope, parameterIndex, depth + 1);
      return values?.length === 1 ? values[0] : undefined;
    }
    const assignment: GoAssignment =
      scope === undefined
        ? { kind: "none" }
        : findAssignment(tokens, scope, name, position, constantMap, constellation);
    if (assignment.kind === "conditional") return undefined;
    // A local's value that reads a loop variable, as `progress := i + firstTick` does in a loop body, reads that
    // Iteration's value for it
    if (assignment.kind === "dominating")
      return evaluateGoExpression(
        parseGoExpression(tokens, assignment.valueStart).expression,
        (inner) =>
          iteration?.get(inner) ?? resolveAt(inner, assignment.valueStart, depth + 1, constellation, iteration),
      );
    return constantMap.get(name)?.value;
  };

  return {
    readArgumentValues: (callPosition: number, argumentStart: number): number[] | undefined => {
      const argument = parseGoExpression(tokens, argumentStart).expression;
      const clampValues = readClampedArgument(argument, callPosition);
      if (clampValues !== undefined) return clampValues;
      const value = evaluateGoNumber(argument, (name) => resolveAt(name, callPosition, 0, undefined));
      return value === undefined ? undefined : [value];
    },
    readParameterIterations: (position: number): Map<string, number>[] => {
      const scope = findScope(position);
      if (scope === undefined) return [new Map()];
      return scope.parameters.reduce<Map<string, number>[]>(
        (iterations, name, index) => {
          const values = readParameterValues(scope, index, 1);
          return values === undefined
            ? iterations
            : iterations.flatMap((iteration) => values.map((value) => new Map(iteration).set(name, value)));
        },
        [new Map()],
      );
    },
    resolveAssignment: (name: string, position: number): number | undefined => {
      const scope = findScope(position);
      if (scope === undefined || scope.parameters.includes(name)) return undefined;
      const assignment = findAssignment(tokens, scope, name, position, constantMap, undefined);
      return assignment.kind === "dominating" ? assignment.valueStart : undefined;
    },
    resolveConstellationName: (name: string, position: number, constellation: number): GoValue | undefined =>
      resolveAt(name, position, 0, constellation),
    resolveName: (name: string, position: number, iteration?: ReadonlyMap<string, number>): GoValue | undefined =>
      resolveAt(name, position, 0, undefined, iteration),
  };
};
