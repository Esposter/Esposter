import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStanceActions } from "#src/models/kit/KitStanceActions";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { tagKitHits } from "#src/services/kit/tagKitHits";

// A stance entered on a combatant's character for its seconds, restarting the one it holds: its kit is built once, the
// Combatant's with the stance's actions in place of its own, each of whose hits deals the kind of attack its action does
// Unless it names its own
export const enterKitStance = (
  kitEffectState: KitEffectState,
  { characterId, kit }: Combatant,
  actions: KitStanceActions,
  secondsRemaining: number,
): void =>
  addKitEffect(kitEffectState, {
    characterId,
    elapsedSeconds: 0,
    kind: "stance",
    kit: tagKitHits({ ...kit, ...actions }),
    secondsRemaining,
  });
