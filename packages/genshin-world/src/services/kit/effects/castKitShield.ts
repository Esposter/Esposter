import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitShield } from "#src/models/kit/KitShield";
import type { Except } from "type-fest";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";

// A shield a character casts onto the team's effects, recast over the one it holds as addKitEffect recasts it, and
// Returned for a kit that reads it again
export const castKitShield = (
  kitEffectState: KitEffectState,
  characterId: number,
  shield: Except<KitShield, "characterId" | "kind">,
): KitShield => {
  const kitShield: KitShield = { ...shield, characterId, kind: "shield" };
  addKitEffect(kitEffectState, kitShield);
  return kitShield;
};
