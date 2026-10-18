import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { hitPartyMember } from "#src/services/kit/hitPartyMember";
import { WILDLIFE_CHARGE_DAMAGE } from "#src/services/wildlife/constants";

// A boar's charge on the member on the field: its share of the member's Max HP is first taken by the team's shields, and
// What none of them absorbs is taken from the member as the share of its Max HP it is
export const chargePartyMember = (party: Party, combatant: Combatant, kitEffectState: KitEffectState): void =>
  hitPartyMember(party, combatant, kitEffectState, WILDLIFE_CHARGE_DAMAGE * combatant.attributes.maxHealth);
