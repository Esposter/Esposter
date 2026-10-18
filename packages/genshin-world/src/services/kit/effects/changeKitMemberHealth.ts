import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { healPartyMember } from "#src/services/party/healPartyMember";

// The one way a kit changes a party member's current HP, its own or another's, by an amount of HP: a positive amount heals
// It, raised by the source's Healing Bonus and the member's Incoming Healing Bonus as the buffs on them stand, and a
// Negative one drains it as it is, as gcsim's Heal and Drain price them. The change is recorded with the source's
// Character, so every kit of the team hears it. A member whose combatant is not built yet has no Max HP to take it by
export const changeKitMemberHealth = (
  { characterIdCombatantMap, kitEffectState: { effects }, party }: KitContext,
  source: Combatant,
  characterId: number,
  health: number,
): void => {
  const member = characterIdCombatantMap.get(characterId);
  if (!member) return;
  const { maxHealth } = member.attributes;
  if (health < 0) {
    damagePartyMember(party, characterId, -health / maxHealth, source.characterId);
    return;
  }
  const healingBonus = getBuffedCombatant(source, effects, party, characterIdCombatantMap).attributes.attributeTotalMap[
    Attribute.HealingBonus
  ];
  const incomingHealingBonus = getBuffedCombatant(member, effects, party, characterIdCombatantMap).attributes
    .attributeTotalMap[Attribute.IncomingHealingBonus];
  healPartyMember(
    party,
    characterId,
    (health * (1 + healingBonus + incomingHealingBonus)) / maxHealth,
    source.characterId,
  );
};
