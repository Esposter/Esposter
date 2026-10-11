import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitStrikeContext } from "#src/models/kit/KitStrikeContext";

import { AuraType } from "#src/models/combat/AuraType";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { LUNAR_CHARGED_HIT_GAUGE } from "#src/services/combat/aura/constants";
import { consumeAuras } from "#src/services/combat/aura/consumeAuras";
import { getAuraSourceIds } from "#src/services/combat/aura/getAuraSourceIds";
import { strikeLunarReaction } from "#src/services/kit/strikeLunarReaction";

// A Lunar-Charged hit on an enemy, written into it in place: the members whose Electro or Hydro still stands in its
// Auras contribute to it, owned by the member whose Electro or Hydro last charged it, and a hit that strikes takes 0.4U
// From its Electro and its Hydro, as gcsim (MIT) pkg/reactable/lunarcharged.go deals it
// Https://github.com/genshinsim/gcsim/blob/main/pkg/reactable/lunarcharged.go
export const strikeLunarCharged = (enemy: Enemy, context: KitStrikeContext): void => {
  const { elementalState } = enemy;
  const contributorIds = new Set([
    ...getAuraSourceIds(elementalState, AuraType.Electro),
    ...getAuraSourceIds(elementalState, AuraType.Hydro),
  ]);
  if (
    !strikeLunarReaction(enemy, LunarReactionType.LunarCharged, contributorIds, enemy.electroChargedCombatant, context)
  )
    return;
  consumeAuras(elementalState.auras, [AuraType.Electro, AuraType.Hydro], LUNAR_CHARGED_HIT_GAUGE);
};
