import type { Kit } from "#src/models/kit/Kit";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

// A character's kit with passive modules answering beside it: each hook the kit has runs first and then each module's, so
// the kit's own passives come before a weapon's or a set's. A module hears only the events `answersEvent` takes
export const getPassiveKit = (
  kit: Kit,
  passiveModules: readonly PassiveModule[],
  answersEvent: (event: KitEvent) => boolean = () => true,
): Kit => ({
  ...kit,
  getPassiveBonuses: (combatant, healthShare, deployedCombatants, effects) =>
    [kit, ...passiveModules].flatMap(
      ({ getPassiveBonuses }) => getPassiveBonuses?.(combatant, healthShare, deployedCombatants, effects) ?? [],
    ),
  getStrikeAdditiveBaseDamageBonus: (strike, enemy, party, effects) =>
    (kit.getStrikeAdditiveBaseDamageBonus?.(strike, enemy, party, effects) ?? 0) +
    passiveModules.reduce(
      (sum, passive) => sum + (passive.getStrikeAdditiveBaseDamageBonus?.(strike, enemy, party, effects) ?? 0),
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
});
