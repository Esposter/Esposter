import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";

// Spends all a character holds of a resource, dropping it from the team's effects at once, and returns what it held
export const spendKitResource = (kitEffectState: KitEffectState, characterId: number, id: string): number => {
  const held = countKitResource(kitEffectState.effects, characterId, id);
  removeKitEffects(
    kitEffectState,
    (effect) => effect.kind === "status" && effect.characterId === characterId && effect.id === id,
  );
  return held;
};
