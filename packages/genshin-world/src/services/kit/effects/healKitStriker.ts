import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";
import type { Party } from "#src/models/party/Party";

import { healPartyMember } from "#src/services/party/healPartyMember";

// Heals the character that struck an enemy by the share of its ATK the hit gives its striker, as the hit's own
// Attack share reads the striker as it is priced. Its Healing Bonus is not read
export const healKitStriker = (party: Party, combatant: Combatant, kitHit: KitHit): void => {
  const healAttackShare = kitHit.healAttackShare?.(combatant) ?? 0;
  if (healAttackShare > 0)
    healPartyMember(
      party,
      combatant.characterId,
      (healAttackShare * combatant.attributes.attack) / combatant.attributes.maxHealth,
    );
};
