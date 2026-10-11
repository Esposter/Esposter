import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";

// Heals the character that struck an enemy by the share of its ATK the hit gives its striker, as the hit's own
// Attack share reads the striker as it is priced
export const healKitStriker = (
  context: KitContext,
  combatant: Combatant,
  pricedCombatant: Combatant,
  kitHit: KitHit,
): void => {
  const healAttackShare = kitHit.healAttackShare?.(pricedCombatant) ?? 0;
  if (healAttackShare > 0)
    changeKitMemberHealth(
      context,
      combatant,
      combatant.characterId,
      healAttackShare * pricedCombatant.attributes.attack,
    );
};
