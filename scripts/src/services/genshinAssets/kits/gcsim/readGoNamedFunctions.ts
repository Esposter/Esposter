import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findClosingBrace } from "#src/services/genshinAssets/kits/gcsim/readGoConstantLoops";

// A named function or method of a file, by its name and the positions its body opens and closes at
export interface GoNamedFunction {
  bodyEnd: number;
  bodyStart: number;
  name: string;
  parameters: string[];
}

// The position of the `)` closing the `(` at a position, else undefined
const findClosingParenthesis = (tokens: readonly GoToken[], openingPosition: number): number | undefined => {
  let depth = 0;
  for (let position = openingPosition; position < tokens.length; position++)
    if (checkIsGoPunctuation(tokens[position], "(")) depth++;
    else if (checkIsGoPunctuation(tokens[position], ")") && --depth === 0) return position;
  return undefined;
};

// The names a parameter list declares, `(a, b int, c string)` giving `a`, `b` and `c`: a name with no type of its own takes
// The type of the group after it
const readParameterNames = (tokens: readonly GoToken[], openingPosition: number, closingPosition: number): string[] => {
  const groups: GoToken[][] = [[]];
  let depth = 0;
  for (const token of tokens.slice(openingPosition + 1, closingPosition)) {
    if (checkIsGoPunctuation(token, "(") || checkIsGoPunctuation(token, "[") || checkIsGoPunctuation(token, "{"))
      depth++;
    else if (checkIsGoPunctuation(token, ")") || checkIsGoPunctuation(token, "]") || checkIsGoPunctuation(token, "}"))
      depth--;
    if (depth === 0 && checkIsGoPunctuation(token, ",")) groups.push([]);
    else groups.at(-1)?.push(token);
  }
  const names: string[] = [];
  let untyped: string[] = [];
  for (const [first, ...rest] of groups) {
    if (first?.kind !== GoTokenKind.Identifier) continue;
    if (rest.length === 0) untyped.push(first.text);
    else {
      names.push(...untyped, first.text);
      untyped = [];
    }
  }
  return names;
};

// The function a `func` token declares, `func (c *char) danceDoubleTicker(...) {` or `func name(...) {`, else undefined.
// A closure, `func() {`, has no name and is no function here
const readNamedFunction = (tokens: readonly GoToken[], funcPosition: number): GoNamedFunction | undefined => {
  let namePosition = funcPosition + 1;
  if (checkIsGoPunctuation(tokens[namePosition], "(")) {
    const receiverEnd = findClosingParenthesis(tokens, namePosition);
    if (receiverEnd === undefined) return undefined;
    namePosition = receiverEnd + 1;
  }
  const name = tokens[namePosition];
  if (name?.kind !== GoTokenKind.Identifier || !checkIsGoPunctuation(tokens[namePosition + 1], "(")) return undefined;
  const parametersEnd = findClosingParenthesis(tokens, namePosition + 1);
  if (parametersEnd === undefined) return undefined;
  let bodyStart = parametersEnd + 1;
  while (tokens[bodyStart] !== undefined && !checkIsGoPunctuation(tokens[bodyStart], "{")) bodyStart++;
  const bodyEnd = findClosingBrace(tokens, bodyStart);
  return bodyEnd === undefined
    ? undefined
    : { bodyEnd, bodyStart, name: name.text, parameters: readParameterNames(tokens, namePosition + 1, parametersEnd) };
};

// Each named function and method of a file, read once for the positions in it
export const readGoNamedFunctions = (tokens: readonly GoToken[]): GoNamedFunction[] =>
  tokens.flatMap((token, position) => {
    if (token.text !== "func") return [];
    const namedFunction = readNamedFunction(tokens, position);
    return namedFunction === undefined ? [] : [namedFunction];
  });

// The innermost named function a position is in, its body opening last among those enclosing it, else undefined. A
// Closure in a function is in that function, as the closure runs in its body
export const readGoEnclosingFunction = (
  namedFunctions: readonly GoNamedFunction[],
  position: number,
): GoNamedFunction | undefined =>
  namedFunctions
    .filter(({ bodyEnd, bodyStart }) => bodyStart < position && position < bodyEnd)
    .reduce<GoNamedFunction | undefined>(
      (innermost, namedFunction) =>
        innermost === undefined || namedFunction.bodyStart > innermost.bodyStart ? namedFunction : innermost,
      undefined,
    );

// The positions a method of a file is called at, `c.danceDoubleTicker(` and its kin, each at the method's name
export const readGoMethodCallSites = (tokens: readonly GoToken[], name: string): number[] =>
  tokens.flatMap((token, position) =>
    token.kind === GoTokenKind.Identifier &&
    token.text === name &&
    checkIsGoPunctuation(tokens[position - 1], ".") &&
    checkIsGoPunctuation(tokens[position + 1], "(")
      ? [position]
      : [],
  );
