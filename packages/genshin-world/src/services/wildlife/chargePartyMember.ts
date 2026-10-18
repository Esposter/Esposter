import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { absorbKitShield } from "#src/services/kit/effects/absorbKitShield";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { WILDLIFE_CHARGE_DAMAGE } from "#src/services/wildlife/constants";

// A boar's charge on the member on the field: its share of the member's Max HP is first taken by the team's shields, and
// What none of them absorbs is taken from the member as the share of its Max HP it is
export const chargePartyMember = (party: Party, combatant: Combatant, kitEffectState: KitEffectState): void => {
  const { maxHealth } = combatant.attributes;
  const shields = kitEffectState.effects.filter((effect) => checkIsKitShieldLive(effect));
  const overflow = absorbKitShield(shields, combatant, WILDLIFE_CHARGE_DAMAGE * maxHealth);
  damagePartyMember(party, combatant.characterId, overflow / maxHealth);
};
