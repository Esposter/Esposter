import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { PLACE_REGEX } from "#src/services/genshinAssets/kits/gcsim/constants";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readArgumentText } from "#src/services/genshinAssets/kits/gcsim/readArgumentText";

// The offset a `info.Point{X: x, Y: y}` literal gives, forward as its Y, or none for a nil argument. A bare name is read
// At the literal its dominating assignment gives. Undefined where the argument is any other form
export const readOffset = (
  tokens: readonly GoToken[],
  start: number,
  resolveName: (name: string) => GoValue | undefined,
  resolveAssignment: (name: string) => number | undefined,
): [number, number] | null | undefined => {
  const text = readArgumentText(tokens, start);
  if (text === "nil") return null;
  const valueStart = PLACE_REGEX.test(text) ? resolveAssignment(text) : start;
  if (valueStart === undefined) return undefined;
  let position = valueStart;
  while (tokens[position]?.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[position + 1], "."))
    position += 2;
  if (tokens[position]?.text !== "Point" || !checkIsGoPunctuation(tokens[position + 1], "{")) return undefined;
  const offset: [number, number] = [0, 0];
  position += 2;
  while (tokens[position] !== undefined && !checkIsGoPunctuation(tokens[position], "}")) {
    const key = tokens[position];
    if (key?.kind !== GoTokenKind.Identifier || !checkIsGoPunctuation(tokens[position + 1], ":")) return undefined;
    const value = evaluateGoNumber(parseGoExpression(tokens, position + 2).expression, resolveName);
    if (typeof value !== "number" || (key.text !== "X" && key.text !== "Y")) return undefined;
    offset[key.text === "X" ? 0 : 1] = value;
    position = parseGoExpression(tokens, position + 2).end;
    if (checkIsGoPunctuation(tokens[position], ",")) position++;
  }
  return offset;
};
