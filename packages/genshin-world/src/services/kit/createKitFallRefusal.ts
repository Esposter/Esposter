import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { FallRefusal } from "#src/models/party/FallRefusal";

const FALL_REFUSED_HP = 1;

// The refusal of a fall a member's own kit makes, which leaves the member at 1 HP while the kit's check holds
export const createKitFallRefusal = (combatant: Combatant, kitEffectState: KitEffectState): FallRefusal => ({
  healthShare: FALL_REFUSED_HP / combatant.attributes.maxHealth,
  refuses: () => combatant.kit.refusesFall?.(combatant, kitEffectState) === true,
});
