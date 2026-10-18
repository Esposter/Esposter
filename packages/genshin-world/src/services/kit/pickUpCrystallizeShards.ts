import type { KitContext } from "#src/models/kit/KitContext";
import type { GroundPoint } from "genshin-engine";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import {
  CRYSTALLIZE_SHARD_PICKUP_DELAY_SECONDS,
  CRYSTALLIZE_SHARD_PICKUP_RADIUS,
  CRYSTALLIZE_SHARD_SECONDS,
  CRYSTALLIZE_SHIELD_SECONDS,
} from "#src/services/combat/shield/constants";
import { castKitShield } from "#src/services/kit/effects/castKitShield";

// The Crystallize shards the body of the character on the field stands within reach of, picked up once each may be:
// Each ends and grants the team its Crystallize shield, which overwrites the one the team held, cast as the character
// Whose reaction left the shard, so the team's kits are told it as gcsim's shield add emits OnShielded with that
// Character its owner (pkg/reactable/crystallize.go:102, pkg/core/player/shield/handler.go:81), and raises its pickup
// By the character on the field into the outbox
export const pickUpCrystallizeShards = (context: KitContext, fieldCharacterId: number, body: GroundPoint): void => {
  for (const effect of context.kitEffectState.effects) {
    if (
      effect.kind !== "crystallizeShard" ||
      effect.secondsRemaining <= 0 ||
      effect.secondsRemaining > CRYSTALLIZE_SHARD_SECONDS - CRYSTALLIZE_SHARD_PICKUP_DELAY_SECONDS ||
      Math.hypot(effect.position.x - body.x, effect.position.z - body.z) > CRYSTALLIZE_SHARD_PICKUP_RADIUS
    )
      continue;
    const { characterId, element, health } = effect;
    effect.secondsRemaining = 0;
    castKitShield(context, characterId, {
      element,
      health,
      isCrystallize: true,
      secondsRemaining: CRYSTALLIZE_SHIELD_SECONDS,
    });
    context.outbox.push({ characterId: fieldCharacterId, element, kind: KitEventKind.CrystallizeShardPickedUp });
  }
};
