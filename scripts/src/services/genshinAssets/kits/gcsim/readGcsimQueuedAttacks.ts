import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

const QUEUE_CALLEES = new Set(["QueueAttack", "QueueAttackWithSnap"]);
// The damage delay's place among a queue call's arguments, the fourth in both of them
const DELAY_ARGUMENT_INDEX = 3;

const skipNewlines = (tokens: readonly GoToken[], position: number): number => {
  let cursor = position;
  while (tokens[cursor]?.kind === GoTokenKind.Newline) cursor++;
  return cursor;
};

// The first token of each argument of the call opening at the position, from its parenthesis to its closing one
const readArgumentStarts = (tokens: readonly GoToken[], openingPosition: number): number[] => {
  const starts: number[] = [];
  let position = skipNewlines(tokens, openingPosition + 1);
  while (tokens[position] !== undefined && !checkIsGoPunctuation(tokens[position], ")")) {
    starts.push(position);
    position = skipNewlines(tokens, parseGoExpression(tokens, position).end);
    if (checkIsGoPunctuation(tokens[position], ",")) position = skipNewlines(tokens, position + 1);
  }
  return starts;
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

// The numbers a file's locals are first given with `:=`, `windup := 0`, which a delay written in terms of a local reads, as
// The local is its first value before a branch of the function changes it
const readLocalNumberMap = (tokens: readonly GoToken[]): Map<string, number> => {
  const localNumberMap = new Map<string, number>();
  for (const [position, token] of tokens.entries()) {
    const value = tokens[position + 2];
    if (
      token.kind === GoTokenKind.Identifier &&
      checkIsGoPunctuation(tokens[position + 1], ":=") &&
      value?.kind === GoTokenKind.Number &&
      !localNumberMap.has(token.text)
    )
      localNumberMap.set(token.text, Number(value.text.replaceAll("_", "")));
  }
  return localNumberMap;
};

// Each `QueueAttack` and `QueueAttackWithSnap` call of a gcsim character's action files, its `AttackInfo` read from its
// Inline literal or from the name it passes, and its damage delay read as the fourth argument, where the constants, the
// Locals' first numbers and literal numbers give it a value
export const readGcsimQueuedAttacks = (
  sources: readonly GoSource[],
  constantMap: ReadonlyMap<string, GoConstant>,
): GcsimQueuedAttack[] => {
  return sources.flatMap(({ path: file, source }) => {
    const tokens = tokenizeGo(source);
    const localNumberMap = readLocalNumberMap(tokens);
    const resolveName = (name: string) => constantMap.get(name)?.value ?? localNumberMap.get(name);
    const queuedAttacks: GcsimQueuedAttack[] = [];
    for (const [position, token] of tokens.entries()) {
      if (token.kind !== GoTokenKind.Identifier || !QUEUE_CALLEES.has(token.text)) continue;
      if (!checkIsGoPunctuation(tokens[position + 1], "(")) continue;
      const argumentStarts = readArgumentStarts(tokens, position + 1);
      const [attackStart, delayStart] = [argumentStarts[0], argumentStarts[DELAY_ARGUMENT_INDEX]];
      if (attackStart === undefined) continue;
      const inlineAttackPosition = findInlineAttackPosition(tokens, attackStart);
      const delayExpression = delayStart === undefined ? undefined : parseGoExpression(tokens, delayStart).expression;
      const delayValue = delayExpression === undefined ? undefined : evaluateGoExpression(delayExpression, resolveName);
      queuedAttacks.push({
        attackLine: inlineAttackPosition === undefined ? undefined : tokens[inlineAttackPosition]?.line,
        attackName:
          inlineAttackPosition === undefined
            ? getPassedName(parseGoExpression(tokens, attackStart).expression)
            : undefined,
        delay: typeof delayValue === "number" ? delayValue : undefined,
        delayLine: tokens[delayStart ?? position]?.line ?? token.line,
        file,
        line: token.line,
      });
    }
    return queuedAttacks;
  });
};
