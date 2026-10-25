import type { ConstantLoop } from "#src/models/genshinAssets/kits/gcsim/ConstantLoop";
import type { GcsimAttackIteration } from "#src/models/genshinAssets/kits/gcsim/GcsimAttackIteration";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findEnclosingOpen } from "#src/services/genshinAssets/kits/gcsim/findEnclosingOpen";

// The iteration an if around the position puts it in: the innermost block it sits in opened by `if i == 0 {`, where `i`
// Is a constant loop's variable around the position and `0` a whole number, else Undefined
export const readIterationAt = (
  tokens: readonly GoToken[],
  position: number,
  loops: readonly ConstantLoop[],
): GcsimAttackIteration | undefined => {
  const open = findEnclosingOpen(tokens, position);
  if (open === undefined) return undefined;
  const [ifToken, variableToken, operatorToken, valueToken] = [
    tokens[open - 4],
    tokens[open - 3],
    tokens[open - 2],
    tokens[open - 1],
  ];
  const value = Number(valueToken?.text);
  if (
    ifToken?.text !== "if" ||
    variableToken?.kind !== GoTokenKind.Identifier ||
    !checkIsGoPunctuation(operatorToken, "==") ||
    valueToken?.kind !== GoTokenKind.Number ||
    !Number.isInteger(value)
  )
    return undefined;
  const variable = variableToken.text;
  const isLoopVariable = loops.some(
    ({ bodyEnd, bodyStart, iterations }) =>
      bodyStart < position && position < bodyEnd && iterations.some((iteration) => iteration.has(variable)),
  );
  return isLoopVariable ? { value, variable } : undefined;
};
