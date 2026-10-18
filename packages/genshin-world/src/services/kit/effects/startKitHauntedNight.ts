import type { KitEffectState } from "#src/models/kit/KitEffectState";

import {
  HAUNTED_NIGHT_STATUS_ID,
  NIGHTINGALE_SONG_EXTRA_STATUS_ID,
  NIGHTINGALE_SONG_STATUS_ID,
} from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { setKitNightingaleCount } from "#src/services/kit/effects/setKitNightingaleCount";

// Starts Haunted Night for the seconds given, restarting it if the character holds it already. Its stacks of Nightingale's
// Song are added to those it holds, and the cap on what Geo Constructs gain it renews
export const startKitHauntedNight = (
  kitEffectState: KitEffectState,
  characterId: number,
  { secondsRemaining, stacks }: { secondsRemaining: number; stacks: number },
): void => {
  const held = countKitResource(kitEffectState.effects, characterId, NIGHTINGALE_SONG_STATUS_ID);
  addKitStatus(kitEffectState, characterId, { id: HAUNTED_NIGHT_STATUS_ID, secondsRemaining });
  setKitNightingaleCount(kitEffectState, characterId, NIGHTINGALE_SONG_STATUS_ID, held + stacks);
  setKitNightingaleCount(kitEffectState, characterId, NIGHTINGALE_SONG_EXTRA_STATUS_ID, 0);
};
