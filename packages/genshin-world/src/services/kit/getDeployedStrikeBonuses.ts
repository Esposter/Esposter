import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { Party } from "#src/models/party/Party";

// The flat base damage, CRIT DMG, CRIT Rate, DMG Bonus and defence ignored the deployed members' party strike hooks add to a strike, each hook
// Given its own member, and the striker's own kit left out, as its own hooks already price the strike
export const getDeployedStrikeBonuses = (
  strike: KitStrike,
  deployedCombatants: readonly DeployedCombatant[],
  enemy: Enemy,
  party: Party,
  effects: readonly KitEffect[],
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
) => {
  const bonuses = {
    additiveBaseDamageBonus: 0,
    criticalDamageBonus: 0,
    criticalRateBonus: 0,
    damageBonus: 0,
    defenseIgnored: 0,
  };
  for (const member of deployedCombatants) {
    if (member.characterId === strike.combatant.characterId) continue;
    const bonus = member.kit.getPartyStrikeBonus?.(member, strike, enemy, party, effects, characterIdCombatantMap);
    bonuses.additiveBaseDamageBonus += bonus?.additiveBaseDamageBonus ?? 0;
    bonuses.criticalDamageBonus += bonus?.criticalDamageBonus ?? 0;
    bonuses.criticalRateBonus += bonus?.criticalRateBonus ?? 0;
    bonuses.damageBonus += bonus?.damageBonus ?? 0;
    bonuses.defenseIgnored += bonus?.defenseIgnored ?? 0;
  }
  return bonuses;
};
