import type { GcsimHoldCooldown } from "#src/models/genshinAssets/kits/gcsim/GcsimHoldCooldown";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

// The value each case of the nearest switch before the call sets the local to, `cd = 7.5 * 60`, in the cases' order.
// A case that does not set it leaves the switch with none
export const readSwitchCooldowns = (
  tokens: readonly GoToken[],
  callIndex: number,
  name: string,
  file: string,
  resolveName: (name: string) => GoValue | undefined,
  functionStart: number,
): GcsimHoldCooldown[] => {
  // The search stops at the call's own function's body, so a switch in an earlier function gives none. A closure runs
  // In its enclosing function, so the search passes over the closure's `func` to the switch that sets the local
  let switchIndex = callIndex;
  while (switchIndex > functionStart && tokens[switchIndex]?.text !== "switch") switchIndex--;
  if (switchIndex <= functionStart) return [];
  const openIndex = tokens.findIndex((token, index) => index > switchIndex && checkIsGoPunctuation(token, "{"));
  const closeIndex = findClosing(tokens, openIndex, "{", "}") ?? tokens.length;
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
    if (assignment === -1) return [];
    const frames = readGoNumber(
      evaluateGoExpression(parseGoExpression(tokens, assignment + 2).expression, resolveName),
    );
    if (frames === undefined) return [];
    cooldowns.push({ file, frames, line: tokens[assignment]?.line ?? 0 });
  }
  return cooldowns;
};
