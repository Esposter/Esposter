import type { KitState } from "#src/models/kit/KitState";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { Party } from "#src/models/party/Party";

import { ATTACK_ENERGY } from "#src/services/combat/energy/constants";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { rollKitAttackEnergy } from "#src/services/kit/rollKitAttackEnergy";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

// The energy the strikes that struck an enemy give their characters: each normal or charged attack's rolls its weapon's
// Chance, and gives 1 energy on a pass, unraised by Energy Recharge, up to what the burst costs
export const gainKitAttackEnergy = (
  kitState: KitState,
  struckStrikes: readonly KitStrike[],
  party: Party,
  random: () => number,
): void => {
  for (const { attackTag, combatant } of struckStrikes)
    if (
      checkIsNormalOrChargedAttack(attackTag) &&
      combatant.weaponType !== undefined &&
      rollKitAttackEnergy(kitState, combatant.weaponType, random)
    )
      gainPartyMemberEnergy(party, combatant, ATTACK_ENERGY);
};
