import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { GroundPoint } from "genshin-engine";

import { SOURCEWATER_DROPLET_FIELD_ID } from "#src/services/kit/constants";

// Ends up to `maximum` of a character's Sourcewater Droplets inside the area `isInArea` takes, in the order they were
// Left, each once, and returns how many it ended, as a charge does when its legal evaluation picks them up
export const absorbSourcewaterDroplets = (
  kitEffectState: KitEffectState,
  characterId: number,
  isInArea: (centre: GroundPoint) => boolean,
  maximum: number,
): number => {
  let absorbed = 0;
  for (const effect of kitEffectState.effects) {
    if (absorbed >= maximum) break;
    if (
      effect.kind === "field" &&
      effect.characterId === characterId &&
      effect.id === SOURCEWATER_DROPLET_FIELD_ID &&
      effect.secondsRemaining > 0 &&
      isInArea(effect.centre)
    ) {
      effect.secondsRemaining = 0;
      absorbed++;
    }
  }
  return absorbed;
};
