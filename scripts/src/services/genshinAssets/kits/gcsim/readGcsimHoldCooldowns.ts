import type { GcsimHoldCooldown } from "#src/models/genshinAssets/kits/gcsim/GcsimHoldCooldown";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readGoEnclosingBodyStart } from "#src/services/genshinAssets/kits/gcsim/readGoEnclosingBodyStart";
import { readGoNamedFunctions } from "#src/services/genshinAssets/kits/gcsim/readGoNamedFunctions";
import { readGoNames } from "#src/services/genshinAssets/kits/gcsim/readGoNames";
import { readSwitchCooldowns } from "#src/services/genshinAssets/kits/gcsim/readSwitchCooldowns";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

const COOLDOWN_CALL_NAMES = new Set(["SetCD", "SetCDWithDelay"]);

// The cooldown each case of a skill hold's switch gives the skill: the local the `SetCD` or `SetCDWithDelay` call
// Passes is a switch's local, set in each of its cases. A call passing a literal, or none a switch sets, gives none
export const readGcsimHoldCooldowns = (
  sources: readonly GoSource[],
  constantMap: ReadonlyMap<string, GoConstant>,
): GcsimHoldCooldown[] => {
  const resolveName = (name: string) => constantMap.get(name)?.value;
  for (const { path: file, source } of sources) {
    const tokens = tokenizeGo(source);
    const namedFunctions = readGoNamedFunctions(tokens);
    for (const [index, token] of tokens.entries()) {
      if (!COOLDOWN_CALL_NAMES.has(token.text) || !checkIsGoPunctuation(tokens[index + 1], "(")) continue;
      const call = parseGoExpression(tokens, index).expression;
      const cooldownExpression = call.kind === GoExpressionKind.Call ? call.parameters[1] : undefined;
      const functionStart = readGoEnclosingBodyStart(namedFunctions, index);
      for (const name of cooldownExpression === undefined ? [] : readGoNames(cooldownExpression)) {
        const cooldowns = readSwitchCooldowns(tokens, index, name, file, resolveName, functionStart);
        if (cooldowns.length > 0) return cooldowns;
      }
    }
  }
  return [];
};
