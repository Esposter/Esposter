import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { GroundPoint } from "genshin-engine";

import {
  CRYSTALLIZE_SHARD_PICKUP_DELAY_SECONDS,
  CRYSTALLIZE_SHARD_PICKUP_RADIUS,
  CRYSTALLIZE_SHARD_SECONDS,
  CRYSTALLIZE_SHIELD_SECONDS,
} from "#src/services/combat/shield/constants";
import { castKitShield } from "#src/services/kit/effects/castKitShield";

// The Crystallize shards the body on the field stands within reach of, picked up once each may be: each ends, and grants
// The team its Crystallize shield, which overwrites the one the team held
export const pickUpCrystallizeShards = (kitEffectState: KitEffectState, body: GroundPoint): void => {
  for (const effect of kitEffectState.effects) {
    if (
      effect.kind !== "crystallizeShard" ||
      effect.secondsRemaining <= 0 ||
      effect.secondsRemaining > CRYSTALLIZE_SHARD_SECONDS - CRYSTALLIZE_SHARD_PICKUP_DELAY_SECONDS ||
      Math.hypot(effect.position.x - body.x, effect.position.z - body.z) > CRYSTALLIZE_SHARD_PICKUP_RADIUS
    )
      continue;
    const { characterId, element, health } = effect;
    effect.secondsRemaining = 0;
    castKitShield(kitEffectState, characterId, {
      element,
      health,
      isCrystallize: true,
      secondsRemaining: CRYSTALLIZE_SHIELD_SECONDS,
    });
  }
};
