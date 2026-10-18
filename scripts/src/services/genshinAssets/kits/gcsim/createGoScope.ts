import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readGoEnclosingFunction } from "#src/services/genshinAssets/kits/gcsim/readGoEnclosingFunction";
import { readGoNamedFunctions } from "#src/services/genshinAssets/kits/gcsim/readGoNamedFunctions";

// How many calls a value is followed through, so a cycle of calls gives no value
const MAX_DEPTH = 4;

// The braces a block's assignment dominates a position in: the block it sits in, or the `case` clause of a switch
interface GoBlock {
  end: number;
  start: number;
}

// Whether a name's latest assignment before a position is one that always runs before it, one a branch may skip, or
// None at all in the function
type GoAssignment = { kind: "conditional" } | { kind: "dominating"; valueStart: number } | { kind: "none" };

const checkIsCaseClause = (token: GoToken | undefined): boolean =>
  token?.kind === GoTokenKind.Identifier && (token.text === "case" || token.text === "default");

// The block an assignment at the position sits in, walking back to the brace or `case` opening it and forward to the
// Brace or the next `case` closing it
const findBlock = (tokens: readonly GoToken[], position: number): GoBlock => {
  let depth = 0;
  for (let previous = position - 1; previous >= 0; previous--) {
    const token = tokens[previous];
    if (checkIsGoPunctuation(token, "}")) depth++;
    else if (checkIsGoPunctuation(token, "{")) {
      if (depth === 0) return { end: findClosing(tokens, previous, "{", "}") ?? tokens.length, start: previous };
      depth--;
    } else if (depth === 0 && checkIsCaseClause(token)) {
      let end = tokens.length;
      let caseDepth = 0;
      for (let next = previous + 1; next < tokens.length; next++) {
        if (checkIsGoPunctuation(tokens[next], "{")) caseDepth++;
        else if (checkIsGoPunctuation(tokens[next], "}")) {
          if (caseDepth === 0) {
            end = next;
            break;
          }
          caseDepth--;
        } else if (caseDepth === 0 && checkIsCaseClause(tokens[next])) {
          end = next;
          break;
        }
      }
      return { end, start: previous };
    }
  }
  return { end: tokens.length, start: -1 };
};

// The braces of each closure in a function's body that a position is not in, `func(...) {` ... `}`: a closure's locals
// And assignments are its own, so a reference outside it never reads them
const readOtherClosures = (tokens: readonly GoToken[], scope: GoNamedFunction, position: number): GoBlock[] => {
  const blocks: GoBlock[] = [];
  for (let position = scope.bodyStart + 1; position < scope.bodyEnd; position++) {
    if (
      tokens[position]?.kind !== GoTokenKind.Identifier ||
      tokens[position]?.text !== "func" ||
      !checkIsGoPunctuation(tokens[position + 1], "(")
    )
      continue;
    let start = (findClosing(tokens, position + 1, "(", ")") ?? tokens.length) + 1;
    while (start < tokens.length && !checkIsGoPunctuation(tokens[start], "{")) start++;
    const end = findClosing(tokens, start, "{", "}") ?? tokens.length;
    if (!(start < position && position < end)) blocks.push({ end, start });
  }
  return blocks;
};

// Whether a token position sits in one of the blocks
const checkIsInBlocks = (blocks: readonly GoBlock[], index: number): boolean =>
  blocks.some(({ end, start }) => start < index && index < end);

// The default of a local declared with its ok flag, `travel, ok := p["travel"]`: the first constant its own assignments
// Give, `travel = 5` in the branch that defaults it, since the player's parameter is absent in the default run
const findOkDefault = (
  tokens: readonly GoToken[],
  scope: GoNamedFunction,
  name: string,
  position: number,
  constantMap: ReadonlyMap<string, GoConstant>,
): number | undefined => {
  const otherClosures = readOtherClosures(tokens, scope, position);
  let isOkDeclared = false;
  let defaultStart: number | undefined;
  for (let previous = scope.bodyStart + 1; previous < position; previous++) {
    const value = tokens[previous + 2];
    if (
      tokens[previous]?.kind !== GoTokenKind.Identifier ||
      tokens[previous]?.text !== name ||
      checkIsGoPunctuation(tokens[previous - 1], ".") ||
      checkIsInBlocks(otherClosures, previous)
    )
      continue;
    if (checkIsGoPunctuation(tokens[previous + 1], ",") && checkIsGoPunctuation(tokens[previous + 3], ":="))
      isOkDeclared = true;
    else if (
      defaultStart === undefined &&
      (checkIsGoPunctuation(tokens[previous + 1], "=") || checkIsGoPunctuation(tokens[previous + 1], ":=")) &&
      (value?.kind === GoTokenKind.Number || (value?.kind === GoTokenKind.Identifier && constantMap.has(value.text)))
    )
      defaultStart = previous + 2;
  }
  return isOkDeclared ? defaultStart : undefined;
};

// The operators an update such as `+=` is split into before its `=`, `++` and `--` being tokens of their own
const UPDATE_OPERATORS = new Set(["%", "*", "+", "-", "/"]);

// Whether the name token at a position is set to a value by `:=` or `=`, or updated by `+=`, `*=`, `++` and the like
const readAssignmentKind = (tokens: readonly GoToken[], position: number): "update" | "value" | undefined => {
  const next = tokens[position + 1];
  if (checkIsGoPunctuation(next, ":=") || checkIsGoPunctuation(next, "=")) return "value";
  if (checkIsGoPunctuation(next, "++") || checkIsGoPunctuation(next, "--")) return "update";
  return next?.kind === GoTokenKind.Punctuation &&
    UPDATE_OPERATORS.has(next.text) &&
    checkIsGoPunctuation(tokens[position + 2], "=")
    ? "update"
    : undefined;
};

// The latest assignment to a name in a function before a position, and whether a block of its own always reaches the
// Position, so no branch between the two can skip it. An update reads the value it changes, which no constant gives
const findAssignment = (
  tokens: readonly GoToken[],
  scope: GoNamedFunction,
  name: string,
  position: number,
  constantMap: ReadonlyMap<string, GoConstant>,
): GoAssignment => {
  const okDefault = findOkDefault(tokens, scope, name, position, constantMap);
  if (okDefault !== undefined) return { kind: "dominating", valueStart: okDefault };
  const otherClosures = readOtherClosures(tokens, scope, position);
  let latest: { kind: "update" | "value"; position: number } | undefined;
  for (let previous = scope.bodyStart + 1; previous < position; previous++) {
    const kind =
      tokens[previous]?.kind === GoTokenKind.Identifier &&
      tokens[previous]?.text === name &&
      !checkIsGoPunctuation(tokens[previous - 1], ".") &&
      !checkIsInBlocks(otherClosures, previous)
        ? readAssignmentKind(tokens, previous)
        : undefined;
    if (kind !== undefined) latest = { kind, position: previous };
  }
  if (latest === undefined) return { kind: "none" };
  if (latest.kind === "update") return { kind: "conditional" };
  const block = findBlock(tokens, latest.position);
  return block.start < position && position < block.end
    ? { kind: "dominating", valueStart: latest.position + 2 }
    : { kind: "conditional" };
};

// The values a gcsim action's hold takes, `min(max(p["hold"], 0), 1)` taking 0 for the press and 1 for the hold: the
// Lookup's own value is unknown, but the clamp bounds it to 0 and 1. Only that clamp on the `hold` key has this shape,
// Else Undefined
const readClampValues = (expression: GoExpression): number[] | undefined => {
  if (expression.kind !== GoExpressionKind.Call || expression.callee !== "min" || expression.parameters.length !== 2)
    return undefined;
  const [inner, upper] = expression.parameters;
  if (inner?.kind !== GoExpressionKind.Call || inner.callee !== "max" || inner.parameters.length !== 2)
    return undefined;
  const [lookup, lower] = inner.parameters;
  if (
    lookup?.kind !== GoExpressionKind.Index ||
    lookup.target.kind !== GoExpressionKind.Identifier ||
    lookup.target.name !== "p" ||
    lookup.index.kind !== GoExpressionKind.String ||
    lookup.index.value !== "hold" ||
    lower?.kind !== GoExpressionKind.Number ||
    lower.value !== 0 ||
    upper?.kind !== GoExpressionKind.Number ||
    upper.value !== 1
  )
    return undefined;
  return [0, 1];
};

// The value of each name a Go source's references read at a position: a parameter's from its callers' arguments, a
// Local's from its dominating assignment, else a constant's. A name no assignment reaches, or a branch may skip, has none,
// So a local of another function is never read
export const createGoScope = (tokens: readonly GoToken[], constantMap: ReadonlyMap<string, GoConstant>) => {
  const callPositionsByName = new Map<string, number[]>();
  for (const [position, token] of tokens.entries())
    if (token.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[position + 1], "(")) {
      const positions = callPositionsByName.get(token.text) ?? [];
      positions.push(position);
      callPositionsByName.set(token.text, positions);
    }
  const namedFunctions = readGoNamedFunctions(tokens);
  const findScope = (position: number): GoNamedFunction | undefined =>
    readGoEnclosingFunction(namedFunctions, position);

  // The values of an argument that is a local dominated by a clamp of the action's hold, read at its call's position
  const readClampedArgument = (argument: GoExpression, callPosition: number): number[] | undefined => {
    const scope = findScope(callPosition);
    if (argument.kind !== GoExpressionKind.Identifier || scope === undefined) return undefined;
    const assignment = findAssignment(tokens, scope, argument.name, callPosition, constantMap);
    return assignment.kind === "dominating"
      ? readClampValues(parseGoExpression(tokens, assignment.valueStart).expression)
      : undefined;
  };

  // Each number a function's parameter takes at its call sites, undefined where a call's argument has none
  const readParameterValues = (scope: GoNamedFunction, index: number, depth: number): number[] | undefined => {
    if (depth > MAX_DEPTH) return undefined;
    const callPositions = (callPositionsByName.get(scope.name) ?? []).filter(
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
      const value = evaluateGoNumber(argument, (name) => resolveAt(name, callPosition, depth + 1));
      if (value === undefined) return undefined;
      values.add(value);
    }
    return [...values];
  };

  const resolveAt = (name: string, position: number, depth: number): GoValue | undefined => {
    if (depth > MAX_DEPTH) return undefined;
    const scope = findScope(position);
    const parameterIndex = scope?.parameters.indexOf(name) ?? -1;
    if (scope !== undefined && parameterIndex !== -1) {
      const values = readParameterValues(scope, parameterIndex, depth + 1);
      return values?.length === 1 ? values[0] : undefined;
    }
    const assignment: GoAssignment =
      scope === undefined ? { kind: "none" } : findAssignment(tokens, scope, name, position, constantMap);
    if (assignment.kind === "conditional") return undefined;
    if (assignment.kind === "dominating")
      return evaluateGoExpression(parseGoExpression(tokens, assignment.valueStart).expression, (inner) =>
        resolveAt(inner, assignment.valueStart, depth + 1),
      );
    return constantMap.get(name)?.value;
  };

  return {
    // The numbers an argument of a call takes at the call's position: each of the two a clamp of the action's hold bounds
    // A local to, else the one number it evaluates to, and none where it evaluates to none
    readArgumentValues: (callPosition: number, argumentStart: number): number[] | undefined => {
      const argument = parseGoExpression(tokens, argumentStart).expression;
      const clampValues = readClampedArgument(argument, callPosition);
      if (clampValues !== undefined) return clampValues;
      const value = evaluateGoNumber(argument, (name) => resolveAt(name, callPosition, 0));
      return value === undefined ? undefined : [value];
    },
    // Every combination of the numbers a position's function's parameters take at their call sites, a parameter no
    // Single number reaches left out of each
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
    resolveName: (name: string, position: number): GoValue | undefined => resolveAt(name, position, 0),
    // The first token of a local's value at a position, where one assignment dominates it, as a call passing `ap` reads
    // The constructor `ap := combat.NewCircleHitOnTarget(...)` gave it
    resolveAssignment: (name: string, position: number): number | undefined => {
      const scope = findScope(position);
      if (scope === undefined || scope.parameters.includes(name)) return undefined;
      const assignment = findAssignment(tokens, scope, name, position, constantMap);
      return assignment.kind === "dominating" ? assignment.valueStart : undefined;
    },
  };
};
