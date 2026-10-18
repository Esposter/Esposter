import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Heals every deployed member but the healer by the HP given, as a bubble's bounce heals the team. Unlike a hit's party heal,
// It takes no chance roll and no shield gate, and it leaves the healer out
export const healKitOtherMembers = (context: KitContext, healer: Combatant, healedHp: number): void => {
  for (const characterId of getDeployedCharacterIds(context.party))
    if (characterId !== healer.characterId) changeKitMemberHealth(context, healer, characterId, healedHp);
};
