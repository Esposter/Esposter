import type { ElementalState } from "#src/models/combat/ElementalState";
import type { Reaction } from "#src/models/combat/Reaction";

import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { applyReactionAura } from "#src/services/combat/aura/applyReactionAura";
import { FREEZE_GAUGE_PER_POISE_DAMAGE } from "#src/services/combat/aura/constants";
import { consumeAuras } from "#src/services/combat/aura/consumeAuras";

// A blunt hit on a target, written into its Freeze in place, and the Shatter it triggers: its poise damage drains the
// Freeze first, and a Freeze left after that shatters. The hit's element, if it has one, is applied after it
export const applyBluntHit = (state: ElementalState, poiseDamage: number): Reaction[] => {
  consumeAuras(state.auras, [AuraType.Freeze], FREEZE_GAUGE_PER_POISE_DAMAGE * poiseDamage);
  if (!state.auras.has(AuraType.Freeze)) return [];
  applyReactionAura(state, ReactionType.Shattered, 0);
  return [{ reactionType: ReactionType.Shattered }];
};
