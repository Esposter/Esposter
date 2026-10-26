import type { Reaction } from "#src/models/combat/Reaction";
import type { StellarReactionType } from "#src/models/combat/StellarReactionType";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { EnemyStrikeResult } from "#src/models/kit/EnemyStrikeResult";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { PartyMoonsign } from "#src/models/party/PartyMoonsign";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { applyBluntHit } from "#src/services/combat/aura/applyBluntHit";
import { ElementDamageBonusAttributeMap } from "#src/services/combat/damage/ElementDamageBonusAttributeMap";
import { getDamage } from "#src/services/combat/damage/getDamage";
import { applyKeyedInternalCooldown } from "#src/services/combat/internalCooldown/applyKeyedInternalCooldown";
import { DEFAULT_INTERNAL_COOLDOWN_GROUP } from "#src/services/combat/internalCooldown/constants";
import { InternalCooldownTagGroupMap } from "#src/services/combat/internalCooldown/InternalCooldownTagGroupMap";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { ENEMY_LAUNCHED_STATUS_ID, ENEMY_STAGGER_SECONDS } from "#src/services/enemy/constants";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { applyEnemyElement } from "#src/services/kit/applyEnemyElement";
import { checkIsBluntHit } from "#src/services/kit/checkIsBluntHit";
import { dealKitEnemyDamage } from "#src/services/kit/dealKitEnemyDamage";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { getDirectLunarDamage } from "#src/services/kit/getDirectLunarDamage";
import { getDirectStellarDamage } from "#src/services/kit/getDirectStellarDamage";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { priceEnemyReactions } from "#src/services/kit/priceEnemyReactions";
import { readKitStackedHit } from "#src/services/kit/readKitStackedHit";
import { SHATTERING_ICE_CRITICAL_RATE_BONUS } from "#src/services/party/constants";
import { ID_SEPARATOR } from "@esposter/shared";

// A kit hit landing on an enemy, written into it in place: a blunt hit first shatters a Freeze, then an elemental hit
// Is applied at the gauge its internal cooldown leaves of it. The hit's damage takes its own additive base DMG Bonus
// And what its reactions amplify, catalyze or add as priceEnemyReactions prices them, before the enemy takes it with
// Its reactions' own poise through the one damage point, against the enemy's RES as its statuses leave it, and a
// Launching hit that staggers it leaves it launched. Its element reacts as the party's Moonsign turns its reactions
// Lunar, and a direct Lunar hit is priced by the Lunar formula from the Moonsign's bonuses instead, as a direct Stellar
// Hit is by the Glimmer formula. It returns the energy the hit dropped, whether it was a CRIT hit, the reactions it
// Triggered and those of them that landed and reach round the enemy, and the element it applied at a gauge its cooldown
// Let through
export const strikeEnemy = (
  enemy: Enemy,
  kitHit: KitHit,
  combatant: Combatant,
  context: KitContext,
  moonsign?: PartyMoonsign,
  stellarReactionTypes: readonly StellarReactionType[] = [],
): EnemyStrikeResult => {
  const {
    enemyTables: { enemyKindMap, enemyLevelCurves },
    random,
  } = context;
  const { elementalState } = enemy;
  const { attack, attributeTotalMap } = combatant.attributes;
  const { gauge, internalCooldownTag } = kitHit;
  // The striker's Max HP is read only for a hit that gives a status, as the optional call skips its arguments otherwise
  const status = kitHit.enemyStatus?.(
    combatant,
    getKitMaxHealth(combatant, context.kitEffectState.effects, context.party, context.characterIdCombatantMap),
  );
  if (status) addEnemyStatus(enemy, { ...status });
  // A stacked hit's multiplier and poise are read from the enemy's stacks, which the hit then consumes
  const { poiseDamage, talentMultiplier } = readKitStackedHit(enemy, kitHit);
  // Shattering Ice's CRIT Rate reads the enemy as the hit finds it, before its Freeze shatters or its element lands
  const isShatteringIceTarget =
    combatant.elementalResonances.includes(Element.Cryo) &&
    (elementalState.auras.has(AuraType.Freeze) || elementalState.auras.has(AuraType.Cryo));
  const reactions: Reaction[] = checkIsBluntHit(combatant, kitHit) ? applyBluntHit(elementalState, poiseDamage) : [];
  const element = getKitHitElement(kitHit, combatant);
  let appliedElement: Element | undefined;
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
    reactions.push(
      ...applyEnemyElement(
        enemy,
        element,
        gauge * share,
        combatant,
        moonsign?.lunarReactionTypes,
        stellarReactionTypes,
      ),
    );
    if (gauge * share > 0) appliedElement = element;
  }

  const kind = getEnemyKind(enemyKindMap, enemy.enemyKindId);
  const { defense } = computeEnemyStats(enemyLevelCurves, kind, enemy.level);
  const {
    additiveBaseDamageBonus,
    amplifyingMultiplier,
    poiseDamage: reactionPoiseDamage,
    reachingReactions,
    transformativeDamage,
  } = priceEnemyReactions(kind, enemy, reactions, combatant, element, context);

  // A direct Lunar or Stellar hit is priced as the reaction of its type is, so the party reaction bonuses that reaction
  // Takes on this enemy apply to it
  const { lunarHit, stellarReactionType } = kitHit;
  const directReactionType = lunarHit?.lunarReactionType ?? stellarReactionType;
  const directBonuses =
    directReactionType === undefined
      ? undefined
      : getDeployedReactionBonuses({ combatant, element, enemy, reactionType: directReactionType }, context);
  const isCritical =
    kitHit.isForcedCritical ||
    random() <
      attributeTotalMap[Attribute.CriticalRate] +
        (kitHit.criticalRateBonus ?? 0) +
        (directBonuses?.criticalRateBonus ?? 0) +
        (isShatteringIceTarget ? SHATTERING_ICE_CRITICAL_RATE_BONUS : 0);
  const resistance = getEnemyResistance(kind, enemy, element);
  const damage =
    lunarHit && directBonuses
      ? getDirectLunarDamage(
          kitHit,
          lunarHit,
          talentMultiplier,
          combatant,
          moonsign,
          resistance,
          isCritical,
          directBonuses,
        )
      : stellarReactionType !== undefined && directBonuses
        ? getDirectStellarDamage(
            kitHit,
            stellarReactionType,
            talentMultiplier,
            combatant,
            context,
            resistance,
            isCritical,
            directBonuses,
          )
        : getDamage({
            additiveBaseDamageBonus: additiveBaseDamageBonus + (kitHit.additiveBaseDamageBonus?.(combatant) ?? 0),
            amplifyingMultiplier,
            attackerLevel: combatant.level,
            criticalDamage: attributeTotalMap[Attribute.CriticalDamage] + (kitHit.criticalDamageBonus ?? 0),
            // The element's or the physical DMG Bonus, the all-damage bonus, the normal or charged attack bonus of the
            // Attack's tag, the plunging attack bonus on a plunge, and a hit's own and an enemy's statuses' DMG taken add
            // To the bonus each hit on it reads
            damageBonus:
              attributeTotalMap[
                element === undefined ? Attribute.PhysicalDamageBonus : ElementDamageBonusAttributeMap[element]
              ] +
              attributeTotalMap[Attribute.AllDamageBonus] +
              (kitHit.attackTag === AttackTag.NormalAttack ? attributeTotalMap[Attribute.NormalAttackDamageBonus] : 0) +
              (kitHit.attackTag === AttackTag.ChargedAttack
                ? attributeTotalMap[Attribute.ChargedAttackDamageBonus]
                : 0) +
              (kitHit.attackTag === AttackTag.PlungingAttack
                ? attributeTotalMap[Attribute.PlungingAttackDamageBonus]
                : 0) +
              (kitHit.damageBonus ?? 0) +
              enemy.statuses.reduce((total, { damageTakenBonus }) => total + damageTakenBonus, 0),
            defense,
            defenseIgnored: kitHit.defenseIgnored,
            // The DEF each status takes off the enemy, which the defence multiplier reads against the attacker's level
            defenseReduction: enemy.statuses.reduce(
              (total, { defenseReduction }) => total + (defenseReduction ?? 0),
              0,
            ),
            isCritical,
            resistance,
            stat: attack,
            talentMultiplier,
          });
  const energyDrops = dealKitEnemyDamage(
    enemy,
    { damage: damage + transformativeDamage, poiseDamage: poiseDamage + reactionPoiseDamage },
    element !== undefined,
    combatant,
    context,
  );
  // A launching hit that staggers the enemy throws it airborne for as long as the stagger holds it, as the wiki's Air
  // Stagger level does an enemy whose poise is broken
  if (kitHit.isLaunching && enemy.state === EnemyState.Stagger)
    addEnemyStatus(enemy, {
      damageTakenBonus: 0,
      id: ENEMY_LAUNCHED_STATUS_ID,
      secondsRemaining: ENEMY_STAGGER_SECONDS,
    });
  // A status that follows the damage lands after it, and only when the hit dealt some, as gcsim's attack callbacks read it
  const afterDamageStatus = damage > 0 ? kitHit.enemyStatusAfterDamage?.(combatant) : undefined;
  if (afterDamageStatus) addEnemyStatus(enemy, { ...afterDamageStatus });
  return { appliedElement, energyDrops, isCritical, reachingReactions, reactions };
};
