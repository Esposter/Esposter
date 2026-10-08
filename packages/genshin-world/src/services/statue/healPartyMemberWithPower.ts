import type { Party } from "#src/models/party/Party";
import type { RestorativePower } from "#src/models/statue/RestorativePower";

import { getPartyMember } from "#src/services/party/getPartyMember";
import { BLESSING_HEAL_HEALTH_SHARE } from "#src/services/statue/constants";

// One click on the Blessing heals a member by a tenth of its Max HP, paid from the pool. The pool pays what it holds
// When it holds less, and a member already full takes none. A fallen member takes none either: a fallen team is revived
// By the auto-recover, not by a click. The pool's moment is kept, since the click spends and does not regenerate
export const healPartyMemberWithPower = (
  party: Party,
  characterId: number,
  maxHealth: number,
  power: RestorativePower,
): RestorativePower => {
  const partyMember = getPartyMember(party, characterId);
  if (partyMember.healthShare === 0) return power;
  const healthGain = Math.min(
    BLESSING_HEAL_HEALTH_SHARE * maxHealth,
    (1 - partyMember.healthShare) * maxHealth,
    power.amount,
  );
  partyMember.healthShare += healthGain / maxHealth;
  return { ...power, amount: power.amount - healthGain };
};
