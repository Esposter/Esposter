import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The DMG Bonus a set's status gives the whole party once, however many of its wearers hold the status: the first deployed
// Member holding it gives the bonus and no other does, as the status cannot stack. A member's hook is read on its own kit, so
// The member is the one that gives it
export const getFirstHolderDamageBonus = (
  member: Combatant,
  effectId: string,
  damageBonus: number,
  { kitEffectState, party }: KitContext,
): { damageBonus?: number } => {
  const [firstHolder] = getDeployedCharacterIds(party).filter((characterId) =>
    checkIsKitStatusActive(kitEffectState.effects, characterId, effectId),
  );
  return firstHolder === member.characterId ? { damageBonus } : {};
};
