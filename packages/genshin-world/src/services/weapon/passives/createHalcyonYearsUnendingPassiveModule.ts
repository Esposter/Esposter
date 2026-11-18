import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { countKitStatusStacks } from "#src/services/kit/effects/countKitStatusStacks";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { takeOne } from "@esposter/shared";

const ODE_TO_FLOWERS_ID = "odeToFlowers";
const HALCYON_YEARS_TEAM_SOURCE = "halcyonYearsUnendingTeam";
const MAXIMUM_STACKS = 2;
const DEFENSE_PER_THOUSAND = 1000;

// Halcyon Years Unending at its rank: a Normal or Plunging Attack hit the wielder lands gives Ode to Flowers, the rank's DEF and
// All Elemental DMG Bonus for the rank's seconds, up to two stacks, at most once every the rank's stack cooldown. Two stacks raise
// Every deployed member's All Elemental DMG Bonus by the rank's amount per 1,000 DEF the wielder has, up to the rank's DEF cap,
// For the rank's team seconds
export const createHalcyonYearsUnendingPassiveModule = (params: number[]): PassiveModule => {
  const defenseShare = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const stackCooldownSeconds = takeOne(params, 2);
  const allDamageBonus = takeOne(params, 3);
  const teamDamageBonus = takeOne(params, 5);
  const teamSeconds = takeOne(params, 6);
  const defenseCap = takeOne(params, 7);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        (event.attackTag !== AttackTag.NormalAttack && event.attackTag !== AttackTag.PlungingAttack)
      )
        return;
      const { characterIdCombatantMap, kitEffectState, party } = context;
      if (
        !addPassiveStack(kitEffectState, combatant.characterId, {
          cooldownSeconds: stackCooldownSeconds,
          id: ODE_TO_FLOWERS_ID,
          maximumStacks: MAXIMUM_STACKS,
          perStackBonuses: [
            { amount: defenseShare, attribute: Attribute.DefensePercent },
            { amount: allDamageBonus, attribute: Attribute.AllDamageBonus },
          ],
          seconds,
        }) ||
        countKitStatusStacks(kitEffectState.effects, combatant.characterId, ODE_TO_FLOWERS_ID) < MAXIMUM_STACKS
      )
        return;
      const { attributes } = getBuffedCombatant(combatant, kitEffectState.effects, party, characterIdCombatantMap);
      buffKitTeam(kitEffectState, party, {
        amount: (Math.min(attributes.defense, defenseCap) / DEFENSE_PER_THOUSAND) * teamDamageBonus,
        attribute: Attribute.AllDamageBonus,
        secondsRemaining: teamSeconds,
        source: HALCYON_YEARS_TEAM_SOURCE,
      });
    },
  };
};
