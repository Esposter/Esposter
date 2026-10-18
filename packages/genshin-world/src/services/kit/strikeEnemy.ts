import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { Combatant } from "#src/models/kit/Combatant";
import type { EnemyStrikeResult } from "#src/models/kit/EnemyStrikeResult";
import type { KitHit } from "#src/models/kit/KitHit";
import type { PartyMoonsign } from "#src/models/party/PartyMoonsign";

import { Attribute } from "#src/models/character/Attribute";
import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { applyBluntHit } from "#src/services/combat/aura/applyBluntHit";
import { ElementDamageBonusAttributeMap } from "#src/services/combat/damage/ElementDamageBonusAttributeMap";
import { getDamage } from "#src/services/combat/damage/getDamage";
import { applyKeyedInternalCooldown } from "#src/services/combat/internalCooldown/applyKeyedInternalCooldown";
import { DEFAULT_INTERNAL_COOLDOWN_GROUP } from "#src/services/combat/internalCooldown/constants";
import { InternalCooldownTagGroupMap } from "#src/services/combat/internalCooldown/InternalCooldownTagGroupMap";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { applyEnemyElement } from "#src/services/kit/applyEnemyElement";
import { checkIsBluntHit } from "#src/services/kit/checkIsBluntHit";
import { getDirectLunarDamage } from "#src/services/kit/getDirectLunarDamage";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { priceEnemyReactions } from "#src/services/kit/priceEnemyReactions";
import { readKitStackedHit } from "#src/services/kit/readKitStackedHit";
import { SHATTERING_ICE_CRITICAL_RATE_BONUS } from "#src/services/party/constants";
import { ID_SEPARATOR } from "@esposter/shared";

// A kit hit landing on an enemy, written into it in place: a blunt hit first shatters a Freeze, then an elemental hit
// Is applied at the gauge its internal cooldown leaves of it. The hit's damage takes its own additive base DMG Bonus
// And what its reactions amplify, catalyze or add as priceEnemyReactions prices them, before the enemy takes it with its
// Reactions' own poise through damageEnemy, against the enemy's RES as its statuses leave it. Its element reacts as the
// Party's Moonsign turns its reactions Lunar, and a direct Lunar hit is priced by the Lunar formula from the Moonsign's
// Bonuses instead. It returns the energy the hit dropped, whether it was a CRIT hit, the reactions it triggered and
// Those of them that landed and reach round the enemy
export const strikeEnemy = (
  { enemyKindMap, enemyLevelCurves }: EnemyTables,
  enemy: Enemy,
  kitHit: KitHit,
  combatant: Combatant,
  random: () => number,
  moonsign?: PartyMoonsign,
): EnemyStrikeResult => {
  const { elementalState } = enemy;
  const { attack, attributeTotalMap } = combatant.attributes;
  const { gauge, internalCooldownTag } = kitHit;
  const status = kitHit.enemyStatus?.(combatant);
  if (status) addEnemyStatus(enemy, { ...status });
  // A stacked hit's multiplier and poise are read from the enemy's stacks, which the hit then consumes
  const { poiseDamage, talentMultiplier } = readKitStackedHit(enemy, kitHit);
  // Shattering Ice's CRIT Rate reads the enemy as the hit finds it, before its Freeze shatters or its element lands
  const isShatteringIceTarget =
    combatant.elementalResonances.includes(Element.Cryo) &&
    (elementalState.auras.has(AuraType.Freeze) || elementalState.auras.has(AuraType.Cryo));
  const reactions: Reaction[] = checkIsBluntHit(combatant, kitHit) ? applyBluntHit(elementalState, poiseDamage) : [];
  const element = getKitHitElement(kitHit, combatant);
  if (gauge !== undefined && gauge > 0 && element !== undefined) {
    // A hit with no internal cooldown applies its whole gauge, and one under a cooldown shares it through the cooldown,
    // Counted under its tag's own group where it has one
    let share = 1;
    if (internalCooldownTag !== undefined)
      share = applyKeyedInternalCooldown(
        enemy.internalCooldownMap,
        `${combatant.characterId}${ID_SEPARATOR}${internalCooldownTag}`,
        InternalCooldownTagGroupMap[internalCooldownTag] ?? DEFAULT_INTERNAL_COOLDOWN_GROUP,
        elementalState.seconds,
      );
    reactions.push(...applyEnemyElement(enemy, element, gauge * share, combatant, moonsign?.lunarReactionTypes));
  }

  const kind = getEnemyKind(enemyKindMap, enemy.enemyKindId);
  const { defense } = computeEnemyStats(enemyLevelCurves, kind, enemy.level);
  const {
    additiveBaseDamageBonus,
    amplifyingMultiplier,
    poiseDamage: reactionPoiseDamage,
    reachingReactions,
    transformativeDamage,
  } = priceEnemyReactions(kind, enemy, reactions, combatant, element);

  const isCritical =
    random() <
    attributeTotalMap[Attribute.CriticalRate] + (isShatteringIceTarget ? SHATTERING_ICE_CRITICAL_RATE_BONUS : 0);
  const resistance = getEnemyResistance(kind, enemy, element);
  const damage = kitHit.lunarHit
    ? getDirectLunarDamage(kitHit, kitHit.lunarHit, talentMultiplier, combatant, moonsign, resistance, isCritical)
    : getDamage({
        additiveBaseDamageBonus: additiveBaseDamageBonus + (kitHit.additiveBaseDamageBonus?.(combatant) ?? 0),
        amplifyingMultiplier,
        attackerLevel: combatant.level,
        criticalDamage: attributeTotalMap[Attribute.CriticalDamage],
        // A hit's own DMG Bonus and an enemy's statuses' DMG taken add to the bonus each hit on it reads
        damageBonus:
          attributeTotalMap[
            element === undefined ? Attribute.PhysicalDamageBonus : ElementDamageBonusAttributeMap[element]
          ] +
          (kitHit.damageBonus ?? 0) +
          enemy.statuses.reduce((total, { damageTakenBonus }) => total + damageTakenBonus, 0),
        defense,
        isCritical,
        resistance,
        stat: attack,
        talentMultiplier,
      });
  return {
    energyDrops: damageEnemy(enemy, {
      damage: damage + transformativeDamage,
      poiseDamage: poiseDamage + reactionPoiseDamage,
    }),
    isCritical,
    reachingReactions,
    reactions,
  };
};
