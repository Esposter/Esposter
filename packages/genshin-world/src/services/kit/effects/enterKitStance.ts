import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStanceActions } from "#src/models/kit/KitStanceActions";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { tagKitHits } from "#src/services/kit/tagKitHits";

// A stance entered on a combatant's character for its seconds, restarting the one it holds: its combatant is built once,
// The combatant's with the stance's actions in place of its kit's own, each of whose hits deals the kind of attack its
// Action does unless it names its own
export const enterKitStance = (
  kitEffectState: KitEffectState,
  combatant: Combatant,
  actions: KitStanceActions,
  secondsRemaining: number,
): void =>
  addKitEffect(kitEffectState, {
    characterId: combatant.characterId,
    combatant: { ...combatant, kit: tagKitHits({ ...combatant.kit, ...actions }) },
    elapsedSeconds: 0,
    kind: "stance",
    secondsRemaining,
  });
