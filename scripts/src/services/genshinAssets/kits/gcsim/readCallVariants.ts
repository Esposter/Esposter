import type { CallVariant } from "#src/models/genshinAssets/kits/gcsim/CallVariant";
import type { ConstantLoop } from "#src/models/genshinAssets/kits/gcsim/ConstantLoop";
import type { GoScope } from "#src/models/genshinAssets/kits/gcsim/GoScope";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { TaskClosure } from "#src/models/genshinAssets/kits/gcsim/TaskClosure";

import { readCallParameters } from "#src/services/genshinAssets/kits/gcsim/readCallParameters";
import { readCallSiteDelays } from "#src/services/genshinAssets/kits/gcsim/readCallSiteDelays";

// The ways a method's queue call is run by the calls made of the method in this file, each call's parameter values and
// The delay its closures add with the line that delay is on, one variant per distinct triple of them
export const readCallVariants = (
  tokens: readonly GoToken[],
  scope: GoScope,
  loops: readonly ConstantLoop[],
  taskClosures: readonly TaskClosure[],
  sites: readonly number[],
  parameters: readonly string[],
  isReturned: boolean,
): CallVariant[] => {
  const variants = new Map<string, CallVariant>();
  for (const site of sites) {
    const callParameterSets = readCallParameters(tokens, scope, site, parameters);
    for (const { delay, line } of readCallSiteDelays(tokens, scope, loops, taskClosures, site, isReturned))
      for (const callParameters of callParameterSets)
        variants.set(JSON.stringify([delay, line, [...callParameters]]), { delay, line, parameters: callParameters });
  }
  return [...variants.values()];
};
