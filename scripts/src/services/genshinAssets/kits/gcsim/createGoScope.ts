import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

// How many calls a value is followed through, so a cycle of calls gives no value
const MAX_DEPTH = 4;

// A top-level function of a file: its body's braces, its name's token and the names of its parameters in order
interface GoFunctionScope {
  bodyEnd: number;
  bodyStart: number;
  name: string;
  nameIndex: number;
  parameters: string[];
}

// The braces a block's assignment dominates a position in: the block it sits in, or the `case` clause of a switch
interface GoBlock {
  end: number;
  start: number;
}

// Whether a name's latest assignment before a position is one that always runs before it, one a branch may skip, or
// None at all in the function
type GoAssignment = { kind: "conditional" } | { kind: "dominating"; valueStart: number } | { kind: "none" };

// The position of the bracket closing the one opening at the position, else the end of the tokens
const findClosing = (tokens: readonly GoToken[], openingPosition: number, opening: string, closing: string): number => {
  let depth = 0;
  for (let position = openingPosition; position < tokens.length; position++)
    if (checkIsGoPunctuation(tokens[position], opening)) depth++;
    else if (checkIsGoPunctuation(tokens[position], closing) && --depth === 0) return position;
  return tokens.length;
};

const checkIsCaseClause = (token: GoToken | undefined): boolean =>
  token?.kind === GoTokenKind.Identifier && (token.text === "case" || token.text === "default");

// The names a parameter list declares, the first identifier of each comma-separated piece between its brackets
const readParameterNames = (tokens: readonly GoToken[], start: number, end: number): string[] => {
  const names: string[] = [];
  let depth = 0;
  let pieceStart = start;
  for (let position = start; position <= end; position++) {
    const token = tokens[position];
    if (position === end || (depth === 0 && checkIsGoPunctuation(token, ","))) {
      const name = tokens.slice(pieceStart, position).find(({ kind }) => kind === GoTokenKind.Identifier)?.text;
      if (name !== undefined) names.push(name);
      pieceStart = position + 1;
    } else if (checkIsGoPunctuation(token, "(") || checkIsGoPunctuation(token, "[")) depth++;
    else if (checkIsGoPunctuation(token, ")") || checkIsGoPunctuation(token, "]")) depth--;
  }
  return names;
};

// The function a `func` keyword at the position declares, `func (c *char) name(params) results {`, else Undefined
const readFunctionScope = (tokens: readonly GoToken[], funcPosition: number): GoFunctionScope | undefined => {
  let position = funcPosition + 1;
  if (checkIsGoPunctuation(tokens[position], "(")) position = findClosing(tokens, position, "(", ")") + 1;
  const nameToken = tokens[position];
  if (nameToken?.kind !== GoTokenKind.Identifier || !checkIsGoPunctuation(tokens[position + 1], "(")) return undefined;
  const parametersEnd = findClosing(tokens, position + 1, "(", ")");
  let bodyStart = parametersEnd + 1;
  while (bodyStart < tokens.length && !checkIsGoPunctuation(tokens[bodyStart], "{")) bodyStart++;
  if (bodyStart >= tokens.length) return undefined;
  return {
    bodyEnd: findClosing(tokens, bodyStart, "{", "}"),
    bodyStart,
    name: nameToken.text,
    nameIndex: position,
    parameters: readParameterNames(tokens, position + 2, parametersEnd),
  };
};

// Each top-level function of a file, a closure inside one sharing its locals rather than starting a scope of its own
const readFunctionScopes = (tokens: readonly GoToken[]): GoFunctionScope[] => {
  const scopes: GoFunctionScope[] = [];
  let depth = 0;
  for (const [position, token] of tokens.entries()) {
    if (checkIsGoPunctuation(token, "{")) depth++;
    else if (checkIsGoPunctuation(token, "}")) depth--;
    else if (depth === 0 && token.kind === GoTokenKind.Identifier && token.text === "func") {
      const scope = readFunctionScope(tokens, position);
      if (scope !== undefined) scopes.push(scope);
    }
  }
  return scopes;
};

// The block an assignment at the position sits in, walking back to the brace or `case` opening it and forward to the
// Brace or the next `case` closing it
const findBlock = (tokens: readonly GoToken[], position: number): GoBlock => {
  let depth = 0;
  for (let previous = position - 1; previous >= 0; previous--) {
    const token = tokens[previous];
    if (checkIsGoPunctuation(token, "}")) depth++;
    else if (checkIsGoPunctuation(token, "{")) {
      if (depth === 0) return { end: findClosing(tokens, previous, "{", "}"), start: previous };
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

// The default of a local declared with its ok flag, `travel, ok := p["travel"]`: the first constant its own assignments
// Give, `travel = 5` in the branch that defaults it, since the player's parameter is absent in the default run
const findOkDefault = (
  tokens: readonly GoToken[],
  scope: GoFunctionScope,
  name: string,
  position: number,
  constantMap: ReadonlyMap<string, GoConstant>,
): number | undefined => {
  let isOkDeclared = false;
  let defaultStart: number | undefined;
  for (let previous = scope.bodyStart + 1; previous < position; previous++) {
    const value = tokens[previous + 2];
    if (
      tokens[previous]?.kind !== GoTokenKind.Identifier ||
      tokens[previous]?.text !== name ||
      checkIsGoPunctuation(tokens[previous - 1], ".")
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

// The latest assignment to a name in a function before a position, and whether a block of its own always reaches the
// Position, so no branch between the two can skip it
const findAssignment = (
  tokens: readonly GoToken[],
  scope: GoFunctionScope,
  name: string,
  position: number,
  constantMap: ReadonlyMap<string, GoConstant>,
): GoAssignment => {
  const okDefault = findOkDefault(tokens, scope, name, position, constantMap);
  if (okDefault !== undefined) return { kind: "dominating", valueStart: okDefault };
  let latest: number | undefined;
  for (let previous = scope.bodyStart + 1; previous < position; previous++) {
    const token = tokens[previous];
    if (
      token?.kind === GoTokenKind.Identifier &&
      token.text === name &&
      !checkIsGoPunctuation(tokens[previous - 1], ".") &&
      (checkIsGoPunctuation(tokens[previous + 1], ":=") || checkIsGoPunctuation(tokens[previous + 1], "="))
    )
      latest = previous;
  }
  if (latest === undefined) return { kind: "none" };
  const block = findBlock(tokens, latest);
  return block.start < position && position < block.end
    ? { kind: "dominating", valueStart: latest + 2 }
    : { kind: "conditional" };
};

// The value of each name a Go source's references read at a position: a parameter's from its callers' arguments, a
// Local's from its dominating assignment, else a constant's. A name no assignment reaches, or a branch may skip, has none,
// So a local of another function is never read
export const createGoScope = (tokens: readonly GoToken[], constantMap: ReadonlyMap<string, GoConstant>) => {
  const scopes = readFunctionScopes(tokens);
  const callPositionsByName = new Map<string, number[]>();
  for (const [position, token] of tokens.entries())
    if (token.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[position + 1], "(")) {
      const positions = callPositionsByName.get(token.text) ?? [];
      positions.push(position);
      callPositionsByName.set(token.text, positions);
    }
  const findScope = (position: number): GoFunctionScope | undefined =>
    scopes.find(({ bodyEnd, bodyStart }) => bodyStart < position && position < bodyEnd);

  // Each number a function's parameter takes at its call sites, undefined where a call's argument has none
  const readParameterValues = (scope: GoFunctionScope, index: number, depth: number): number[] | undefined => {
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
      const value = evaluateGoNumber(parseGoExpression(tokens, argumentStart).expression, (name) =>
        resolveAt(name, callPosition, depth + 1),
      );
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
  };
};
