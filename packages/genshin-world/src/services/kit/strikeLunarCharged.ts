import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitStrikeContext } from "#src/models/kit/KitStrikeContext";

import { Attribute } from "#src/models/character/Attribute";
import { AuraType } from "#src/models/combat/AuraType";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { consumeAuras } from "#src/services/combat/aura/consumeAuras";
import { LUNAR_CHARGED_HIT_GAUGE } from "#src/services/combat/aura/constants";
import { getAuraSourceIds } from "#src/services/combat/aura/getAuraSourceIds";
import { CharacterLevelMultiplierMap } from "#src/services/combat/damage/CharacterLevelMultiplierMap";
import { getLunarDamage } from "#src/services/combat/damage/getLunarDamage";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { sumLunarContributions } from "#src/services/combat/damage/sumLunarContributions";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { collectKitEnergyDrops } from "#src/services/kit/collectKitEnergyDrops";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getPartyMoonsign } from "#src/services/party/getPartyMoonsign";
import { takeOne } from "@esposter/shared";

// A Lunar-Charged hit on an enemy, written into it in place. Each member of the deployed team whose Electro or Hydro
// Still stands in the enemy's auras contributes Lunar-Charged's damage of its level multiplier, as the team's buffs leave
// It and the deployed team's Moonsign raises it, with its own CRIT. The hit deals their weighted sum against the enemy's
// Electro RES and takes 0.4U from its Electro and its Hydro, its energy dropping to the team as the element of the member
// Whose Electro or Hydro last triggered it. With no contributor it strikes nothing, as gcsim (MIT)
// Pkg/reactable/lunarcharged.go deals it
// Https://github.com/genshinsim/gcsim/blob/main/pkg/reactable/lunarcharged.go
export const strikeLunarCharged = (enemy: Enemy, context: KitStrikeContext): void => {
  const { characterIdCombatantMap, enemyTables, kitEffectState, party, random } = context;
  const { elementalState } = enemy;
  const sourceIds = new Set([
    ...getAuraSourceIds(elementalState, AuraType.Electro),
    ...getAuraSourceIds(elementalState, AuraType.Hydro),
  ]);
  const moonsign = getPartyMoonsign(characterIdCombatantMap, kitEffectState.effects, party);
  const damages = (party.teams[party.deployedTeamIndex]?.characterIds ?? []).flatMap((characterId) => {
    const combatant = characterIdCombatantMap.get(characterId);
    if (!combatant || !sourceIds.has(characterId)) return [];
    const { attributes, level } = getBuffedCombatant(combatant, kitEffectState.effects, party);
    const { attributeTotalMap } = attributes;
    const damage = getLunarDamage(
      LunarReactionType.LunarCharged,
      takeOne(CharacterLevelMultiplierMap, level),
      attributeTotalMap[Attribute.ElementalMastery],
      moonsign.baseDamageBonusMap[LunarReactionType.LunarCharged] ?? 0,
      moonsign.reactionBonus,
    );
    return [
      random() < attributeTotalMap[Attribute.CriticalRate]
        ? damage * (1 + attributeTotalMap[Attribute.CriticalDamage])
        : damage,
    ];
  });
  if (damages.length === 0) return;
  const kind = getEnemyKind(enemyTables.enemyKindMap, enemy.enemyKindId);
  const resistanceMultiplier = getResistanceMultiplier(getEnemyResistance(kind, enemy, Element.Electro));
  consumeAuras(elementalState.auras, [AuraType.Electro, AuraType.Hydro], LUNAR_CHARGED_HIT_GAUGE);
  collectKitEnergyDrops(
    damageEnemy(enemy, { damage: sumLunarContributions(damages) * resistanceMultiplier, poiseDamage: 0 }),
    enemy.electroChargedCombatant?.element,
    context,
  );
};
