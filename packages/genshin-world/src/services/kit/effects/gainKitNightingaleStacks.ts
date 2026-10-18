import type { KitEffectState } from "#src/models/kit/KitEffectState";

import {
  HAUNTED_NIGHT_STATUS_ID,
  NIGHTINGALE_SONG_EXTRA_STATUS_ID,
  NIGHTINGALE_SONG_STATUS_ID,
} from "#src/services/kit/constants";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { setKitNightingaleCount } from "#src/services/kit/effects/setKitNightingaleCount";

// Gains Nightingale's Song for each Geo Construct on the battlefield while Haunted Night holds, up to the most extra stacks
// The state may gain from constructs, and returns how many it gained
export const gainKitNightingaleStacks = (
  kitEffectState: KitEffectState,
  characterId: number,
  {
    constructCount,
    maximumExtraStacks,
    stacksPerConstruct,
  }: { constructCount: number; maximumExtraStacks: number; stacksPerConstruct: number },
): number => {
  if (!findKitStatus(kitEffectState.effects, characterId, HAUNTED_NIGHT_STATUS_ID)) return 0;
  const extraHeld = countKitResource(kitEffectState.effects, characterId, NIGHTINGALE_SONG_EXTRA_STATUS_ID);
  const gained = Math.min(constructCount * stacksPerConstruct, Math.max(maximumExtraStacks - extraHeld, 0));
  if (gained === 0) return 0;
  const held = countKitResource(kitEffectState.effects, characterId, NIGHTINGALE_SONG_STATUS_ID);
  setKitNightingaleCount(kitEffectState, characterId, NIGHTINGALE_SONG_STATUS_ID, held + gained);
  setKitNightingaleCount(kitEffectState, characterId, NIGHTINGALE_SONG_EXTRA_STATUS_ID, extraHeld + gained);
  return gained;
};
