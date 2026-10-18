import type { KitEffectState } from "#src/models/kit/KitEffectState";

import {
  HAUNTED_NIGHT_STATUS_ID,
  NIGHTINGALE_SONG_EXTRA_STATUS_ID,
  NIGHTINGALE_SONG_STATUS_ID,
} from "#src/services/kit/constants";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { setKitNightingaleCount } from "#src/services/kit/effects/setKitNightingaleCount";

// Consumes a stack of Nightingale's Song for each opponent a Geo hit of the party strikes, up to what the character holds,
// And returns how many it consumed. Spending the last stack ends Haunted Night with its stacks and its cap
export const consumeKitNightingaleStacks = (
  kitEffectState: KitEffectState,
  characterId: number,
  hitCount: number,
): number => {
  const held = countKitResource(kitEffectState.effects, characterId, NIGHTINGALE_SONG_STATUS_ID);
  const consumed = Math.min(held, hitCount);
  if (consumed === held)
    removeKitEffects(
      kitEffectState,
      (effect) =>
        effect.kind === "status" &&
        effect.characterId === characterId &&
        [HAUNTED_NIGHT_STATUS_ID, NIGHTINGALE_SONG_EXTRA_STATUS_ID, NIGHTINGALE_SONG_STATUS_ID].includes(effect.id),
    );
  else setKitNightingaleCount(kitEffectState, characterId, NIGHTINGALE_SONG_STATUS_ID, held - consumed);
  return consumed;
};
