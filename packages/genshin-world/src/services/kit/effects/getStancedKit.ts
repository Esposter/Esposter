import type { Kit } from "#src/models/kit/Kit";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStance } from "#src/models/kit/KitStance";

// The kit a character plays while a stance of its own holds: the stance's actions in place of the kit's, or the kit
// Itself when it holds none
export const getStancedKit = (kit: Kit, effects: readonly KitEffect[], characterId: number): Kit => {
  const stance = effects.find(
    (effect): effect is KitStance => effect.kind === "stance" && effect.characterId === characterId,
  );
  return stance ? { ...kit, ...stance.actions } : kit;
};
