import type { Kit } from "#src/models/kit/Kit";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

// A character's kit with passive modules answering beside it: each hook the kit has runs first and then each module's,
// Its step among them, so the kit's own passives come before a weapon's or a set's. A module hears only the events
// `answersEvent` takes
export const getPassiveKit = (
  kit: Kit,
  passiveModules: readonly PassiveModule[],
  answersEvent: (event: KitEvent) => boolean = () => true,
): Kit => ({
  ...kit,
  getChargedAttackStaminaMultiplier: (context) =>
    (kit.getChargedAttackStaminaMultiplier?.(context) ?? 1) *
    passiveModules.reduce(
      (product, passive) => product * (passive.getChargedAttackStaminaMultiplier?.(context) ?? 1),
      1,
    ),
  getConversionBonuses: (combatant, healthShare) =>
    [kit, ...passiveModules].flatMap(
      ({ getConversionBonuses }) => getConversionBonuses?.(combatant, healthShare) ?? [],
    ),
  getPassiveBonuses: (combatant, healthShare, deployedCombatants, effects) =>
    [kit, ...passiveModules].flatMap(
      ({ getPassiveBonuses }) => getPassiveBonuses?.(combatant, healthShare, deployedCombatants, effects) ?? [],
    ),
  getPartyReactionBonus: (member, reaction, context) =>
    [kit, ...passiveModules].reduce(
      (sum, { getPartyReactionBonus }) => {
        const bonus = getPartyReactionBonus?.(member, reaction, context);
        return {
          additiveBaseDamageBonus: sum.additiveBaseDamageBonus + (bonus?.additiveBaseDamageBonus ?? 0),
          criticalDamageBonus: sum.criticalDamageBonus + (bonus?.criticalDamageBonus ?? 0),
          criticalRateBonus: sum.criticalRateBonus + (bonus?.criticalRateBonus ?? 0),
          damageBonus: sum.damageBonus + (bonus?.damageBonus ?? 0),
        };
      },
      { additiveBaseDamageBonus: 0, criticalDamageBonus: 0, criticalRateBonus: 0, damageBonus: 0 },
    ),
  getPartyStrikeBonus: (member, strike, enemy, party, effects, characterIdCombatantMap) =>
    [kit, ...passiveModules].reduce(
      (sum, { getPartyStrikeBonus }) => {
        const bonus = getPartyStrikeBonus?.(member, strike, enemy, party, effects, characterIdCombatantMap);
        return {
          additiveBaseDamageBonus: sum.additiveBaseDamageBonus + (bonus?.additiveBaseDamageBonus ?? 0),
          criticalDamageBonus: sum.criticalDamageBonus + (bonus?.criticalDamageBonus ?? 0),
          criticalRateBonus: sum.criticalRateBonus + (bonus?.criticalRateBonus ?? 0),
          damageBonus: sum.damageBonus + (bonus?.damageBonus ?? 0),
          defenseIgnored: sum.defenseIgnored + (bonus?.defenseIgnored ?? 0),
        };
      },
      { additiveBaseDamageBonus: 0, criticalDamageBonus: 0, criticalRateBonus: 0, damageBonus: 0, defenseIgnored: 0 },
    ),
  getStrikeAdditiveBaseDamageBonus: (strike, enemy, party, effects, characterIdCombatantMap) =>
    (kit.getStrikeAdditiveBaseDamageBonus?.(strike, enemy, party, effects, characterIdCombatantMap) ?? 0) +
    passiveModules.reduce(
      (sum, passive) =>
        sum + (passive.getStrikeAdditiveBaseDamageBonus?.(strike, enemy, party, effects, characterIdCombatantMap) ?? 0),
      0,
    ),
  getStrikeCriticalRateBonus: (strike, enemy, party, effects) =>
    (kit.getStrikeCriticalRateBonus?.(strike, enemy, party, effects) ?? 0) +
    passiveModules.reduce(
      (sum, passive) => sum + (passive.getStrikeCriticalRateBonus?.(strike, enemy, party, effects) ?? 0),
      0,
    ),
  getStrikeDamageBonus: (strike, enemy, party, effects) =>
    (kit.getStrikeDamageBonus?.(strike, enemy, party, effects) ?? 0) +
    passiveModules.reduce(
      (sum, passive) => sum + (passive.getStrikeDamageBonus?.(strike, enemy, party, effects) ?? 0),
      0,
    ),
  onKitEvent: (event, context, combatant) => {
    kit.onKitEvent?.(event, context, combatant);
    if (!answersEvent(event)) return;
    for (const { onKitEvent } of passiveModules) onKitEvent?.(event, context, combatant);
  },
  onStep: (context, combatant, stepSeconds) => {
    kit.onStep?.(context, combatant, stepSeconds);
    for (const { onStep } of passiveModules) onStep?.(context, combatant, stepSeconds);
  },
});
