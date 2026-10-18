import type { Kit } from "#src/models/kit/Kit";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { sumKitBonuses } from "#src/services/kit/sumKitBonuses";

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
    sumKitBonuses(
      {},
      [kit, ...passiveModules].map(({ getPartyReactionBonus }) => getPartyReactionBonus?.(member, reaction, context)),
    ),
  getPartyStrikeBonus: (member, strike, enemy, party, effects, characterIdCombatantMap) =>
    sumKitBonuses(
      {},
      [kit, ...passiveModules].map(({ getPartyStrikeBonus }) =>
        getPartyStrikeBonus?.(member, strike, enemy, party, effects, characterIdCombatantMap),
      ),
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
