import type { LunarReactionType } from "#src/models/combat/LunarReactionType";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { CharacterLevelMultiplierMap } from "#src/services/combat/damage/CharacterLevelMultiplierMap";
import { getLunarDamage } from "#src/services/combat/damage/getLunarDamage";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { LunarReactionElementMap } from "#src/services/combat/damage/LunarReactionElementMap";
import { sumLunarContributions } from "#src/services/combat/damage/sumLunarContributions";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { collectKitEnergyDrops } from "#src/services/kit/collectKitEnergyDrops";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMoonsign } from "#src/services/party/getPartyMoonsign";
import { takeOne } from "@esposter/shared";

// A Lunar reaction's own hit on an enemy, written into it in place, and whether it struck. Each member of the deployed
// Team among its contributors deals the reaction's Lunar damage of its level multiplier, as the team's buffs leave it
// And the deployed team's Moonsign raises it, with its own CRIT. The hit deals their weighted sum against the enemy's
// RES to the reaction's element, its energy dropping to the team as the element of the member who owns it. With no
// Contributor it strikes nothing, as gcsim (MIT) pkg/reactable deals its Lunar reactions
// Https://github.com/genshinsim/gcsim/blob/main/pkg/reactable/lunarcharged.go
export const strikeLunarReaction = (
  enemy: Enemy,
  lunarReactionType: LunarReactionType,
  contributorIds: ReadonlySet<number>,
  owner: Combatant | undefined,
  context: KitContext,
): boolean => {
  const { characterIdCombatantMap, enemyTables, kitEffectState, party, random } = context;
  const moonsign = getPartyMoonsign(characterIdCombatantMap, kitEffectState.effects, party, context.body.position);
  const damages = getDeployedCharacterIds(party).flatMap((characterId) => {
    const combatant = characterIdCombatantMap.get(characterId);
    if (!combatant || !contributorIds.has(characterId)) return [];
    const { attributes, level } = getBuffedCombatant(combatant, kitEffectState.effects, party, context.body.position);
    const { attributeTotalMap } = attributes;
    const damage = getLunarDamage(
      lunarReactionType,
      takeOne(CharacterLevelMultiplierMap, level),
      attributeTotalMap[Attribute.ElementalMastery],
      moonsign.baseDamageBonusMap[lunarReactionType] ?? 0,
      moonsign.reactionBonus,
    );
    return [
      random() < attributeTotalMap[Attribute.CriticalRate]
        ? damage * (1 + attributeTotalMap[Attribute.CriticalDamage])
        : damage,
    ];
  });
  if (damages.length === 0) return false;
  const kind = getEnemyKind(enemyTables.enemyKindMap, enemy.enemyKindId);
  const resistance = getEnemyResistance(kind, enemy, LunarReactionElementMap[lunarReactionType]);
  collectKitEnergyDrops(
    damageEnemy(enemy, {
      damage: sumLunarContributions(damages) * getResistanceMultiplier(resistance),
      poiseDamage: 0,
    }),
    owner?.element,
    context,
  );
  return true;
};
