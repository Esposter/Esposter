import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { getDamage } from "#src/services/combat/damage/getDamage";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { ENEMY_STRIKE_TALENT_MULTIPLIER } from "#src/services/kit/constants";
import { damagePartyMember } from "#src/services/party/damagePartyMember";

// An enemy's strike on a party member: its ATK as physical damage through the member's defence and physical resistance,
// Taken from the member as the share of its Max HP the damage is
export const strikePartyMember = (party: Party, enemy: Enemy, combatant: Combatant): void => {
  const { attributeTotalMap, defense, maxHealth } = combatant.attributes;
  const { attack } = computeEnemyStats(getEnemyKind(enemy.enemyKindId), enemy.level);
  const damage = getDamage({
    attackerLevel: enemy.level,
    defense,
    resistance: attributeTotalMap[Attribute.PhysicalResistance],
    stat: attack,
    talentMultiplier: ENEMY_STRIKE_TALENT_MULTIPLIER,
  });
  damagePartyMember(party, combatant.characterId, damage / maxHealth);
};
