import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitLunarHit } from "#src/models/kit/KitLunarHit";
import type { PartyMoonsign } from "#src/models/party/PartyMoonsign";

import { Attribute } from "#src/models/character/Attribute";
import { getLunarDamage } from "#src/services/combat/damage/getLunarDamage";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";

// A direct Lunar hit's damage: the Lunar formula over its talent multiplier, as its stacks leave it, of the stat it
// Scales, raised by the Base DMG Bonus the party's Benedictions give its Lunar reaction and the reaction bonus of its
// Ascendant Gleam, with its flat bonus added after, cut by the enemy's RES alone and raised by a CRIT hit's CRIT DMG
// And the hit's own CRIT DMG bonus, as Gcsim (MIT) pkg/enemy/damage.go prices a direct reaction hit. The party reaction
// Bonuses its Lunar reaction takes reach it too: the DMG Bonus into the reaction bonus, the CRIT DMG onto a CRIT hit,
// And the Elevation over the whole last
// Https://github.com/genshinsim/gcsim/blob/main/pkg/enemy/damage.go
export const getDirectLunarDamage = (
  { additiveBaseDamageBonus, criticalDamageBonus = 0 }: KitHit,
  { getScalingStat, lunarReactionType }: KitLunarHit,
  talentMultiplier: number,
  combatant: Combatant,
  moonsign: PartyMoonsign | undefined,
  resistance: number,
  isCritical: boolean,
  partyBonuses: { criticalDamageBonus: number; damageBonus: number; elevationBonus: number },
): number => {
  const { attack, attributeTotalMap } = combatant.attributes;
  const lunarDamage = getLunarDamage(
    lunarReactionType,
    talentMultiplier * (getScalingStat?.(combatant) ?? attack),
    attributeTotalMap[Attribute.ElementalMastery],
    moonsign?.baseDamageBonusMap[lunarReactionType] ?? 0,
    (moonsign?.reactionBonus ?? 0) + partyBonuses.damageBonus,
  );
  return (
    (lunarDamage + (additiveBaseDamageBonus?.(combatant) ?? 0)) *
    getResistanceMultiplier(resistance) *
    (isCritical
      ? 1 + attributeTotalMap[Attribute.CriticalDamage] + criticalDamageBonus + partyBonuses.criticalDamageBonus
      : 1) *
    (1 + partyBonuses.elevationBonus)
  );
};
