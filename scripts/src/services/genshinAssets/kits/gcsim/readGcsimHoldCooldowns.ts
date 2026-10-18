import type { GcsimHoldCooldown } from "#src/models/genshinAssets/kits/gcsim/GcsimHoldCooldown";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

const COOLDOWN_CALL_NAMES = new Set(["SetCD", "SetCDWithDelay"]);

// The local names an expression reads, `cd` in `c.a4CD(c.a1(cd))`, its callees and selectors left out
const readGoNames = (expression: GoExpression): string[] => {
  switch (expression.kind) {
    case GoExpressionKind.Identifier:
      return [expression.name];
    case GoExpressionKind.Call:
      return expression.parameters.flatMap(readGoNames);
    case GoExpressionKind.Index:
      return [...readGoNames(expression.target), ...readGoNames(expression.index)];
    case GoExpressionKind.Binary:
      return [...readGoNames(expression.left), ...readGoNames(expression.right)];
    case GoExpressionKind.Unary:
      return readGoNames(expression.operand);
    default:
      return [];
  }
};

// The index of the brace closing the one at the position
const findClosingBrace = (tokens: readonly GoToken[], openIndex: number): number => {
  let depth = 0;
  for (let index = openIndex; index < tokens.length; index++) {
    if (checkIsGoPunctuation(tokens[index], "{")) depth++;
    else if (checkIsGoPunctuation(tokens[index], "}") && --depth === 0) return index;
  }
  return tokens.length;
};

// The value each case of the nearest switch before the call sets the local to, `cd = 7.5 * 60`, in the cases' order.
// A case that does not set it leaves the switch with none
const readSwitchCooldowns = (
  tokens: readonly GoToken[],
  callIndex: number,
  name: string,
  file: string,
  resolveName: (name: string) => GoValue | undefined,
): GcsimHoldCooldown[] => {
  let switchIndex = callIndex;
  while (switchIndex >= 0 && tokens[switchIndex]?.text !== "switch") switchIndex--;
  if (switchIndex < 0) return [];
  const openIndex = tokens.findIndex((token, index) => index > switchIndex && checkIsGoPunctuation(token, "{"));
  const closeIndex = findClosingBrace(tokens, openIndex);
  const caseIndices = tokens.flatMap((token, index) =>
    index > openIndex && index < closeIndex && token.text === "case" ? [index] : [],
  );
  const cooldowns: GcsimHoldCooldown[] = [];
  for (const [caseOrder, caseIndex] of caseIndices.entries()) {
    const end = caseIndices[caseOrder + 1] ?? closeIndex;
    const assignment = tokens.findIndex(
      (token, index) =>
        index > caseIndex &&
        index < end &&
        token.text === name &&
        token.kind === GoTokenKind.Identifier &&
        checkIsGoPunctuation(tokens[index + 1], "=") &&
        !checkIsGoPunctuation(tokens[index - 1], "."),
    );
    if (assignment < 0) return [];
    const frames = readGoNumber(
      evaluateGoExpression(parseGoExpression(tokens, assignment + 2).expression, resolveName),
    );
    if (frames === undefined) return [];
    cooldowns.push({ file, frames, line: tokens[assignment]?.line ?? 0 });
  }
  return cooldowns;
};

// The cooldown each case of a skill hold's switch gives the skill: the local the `SetCD` or `SetCDWithDelay` call passes
// Is a switch's local, set in each of its cases. A call passing a literal, or none a switch sets, gives none
export const readGcsimHoldCooldowns = (
  sources: readonly GoSource[],
  constantMap: ReadonlyMap<string, GoConstant>,
): GcsimHoldCooldown[] => {
  const resolveName = (name: string) => constantMap.get(name)?.value;
  for (const { path: file, source } of sources) {
    const tokens = tokenizeGo(source);
    for (const [index, token] of tokens.entries()) {
      if (!COOLDOWN_CALL_NAMES.has(token.text) || !checkIsGoPunctuation(tokens[index + 1], "(")) continue;
      const call = parseGoExpression(tokens, index).expression;
      const cooldownExpression = call.kind === GoExpressionKind.Call ? call.parameters[1] : undefined;
      for (const name of cooldownExpression === undefined ? [] : readGoNames(cooldownExpression)) {
        const cooldowns = readSwitchCooldowns(tokens, index, name, file, resolveName);
        if (cooldowns.length > 0) return cooldowns;
      }
    }
  }
  return [];
};
