import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { GroundPoint } from "genshin-engine";

import { SOURCEWATER_DROPLET_FIELD_ID, SOURCEWATER_DROPLET_SECONDS } from "#src/services/kit/constants";
import { castKitField } from "#src/services/kit/effects/castKitField";

// A Sourcewater Droplet a character's kit leaves at a point for its seconds: a field nothing ticks, found by its id,
// Which a charge absorbs
export const castSourcewaterDroplet = (
  kitEffectState: KitEffectState,
  characterId: number,
  centre: GroundPoint,
): void => {
  castKitField(kitEffectState, characterId, centre, {
    id: SOURCEWATER_DROPLET_FIELD_ID,
    nextTickSeconds: Number.POSITIVE_INFINITY,
    onTick: () => undefined,
    radius: 0,
    secondsRemaining: SOURCEWATER_DROPLET_SECONDS,
    tickIntervalSeconds: Number.POSITIVE_INFINITY,
  });
};
