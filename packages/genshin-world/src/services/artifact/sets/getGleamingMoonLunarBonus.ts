import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitReaction } from "#src/models/kit/KitReaction";

import { checkIsLunarReactionType } from "#src/services/combat/checkIsLunarReactionType";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The Lunar Reaction DMG Bonus a Gleaming Moon effect gives every party member's Lunar Reactions. The text gives it for each
// Different effect the party holds and none twice over, as the effects cannot stack, so the first deployed member holding the
// Effect gives it and no other does. A member's hook is read on its own kit, so the member is the one that gives it
export const getGleamingMoonLunarBonus = (
  member: Combatant,
  { reactionType }: KitReaction,
  effectId: string,
  damageBonus: number,
  { kitEffectState, party }: KitContext,
): { damageBonus?: number } => {
  if (!checkIsLunarReactionType(reactionType)) return {};
  const [firstHolder] = getDeployedCharacterIds(party).filter((characterId) =>
    checkIsKitStatusActive(kitEffectState.effects, characterId, effectId),
  );
  return firstHolder === member.characterId ? { damageBonus } : {};
};
