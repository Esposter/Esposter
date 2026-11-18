import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { takeOne } from "@esposter/shared";

const REMEDY_ID = "remedy";
const REMEDY_CRITICAL_RATE_ID = "remedyCriticalRate";
const REMEDY_MAXIMUM_STACKS = 3;

// Dryas's Nocturne at its rank: Max HP rises by the rank's share for one, two or three Remedy stacks. A stack is held for the
// Rank's seconds from an Elemental Skill the wielder uses, from an increase of its Bond of Life, and for the rank's other seconds
// From a heal the wielder performs. With three stacks its Elemental Burst's CRIT Rate rises by the rank's amount, which holds
// For the rank's grace seconds after it falls under three
export const createDryasNocturnePassiveModule = (params: number[]): PassiveModule => {
  const maxHealthShares = [takeOne(params, 0), takeOne(params, 1), takeOne(params, 2)];
  const skillSeconds = takeOne(params, 3);
  const bondOfLifeSeconds = takeOne(params, 4);
  const healSeconds = takeOne(params, 5);
  const criticalRate = takeOne(params, 6);
  const graceSeconds = takeOne(params, 7);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) => {
      const stacks = countKitHolds(effects, characterId, REMEDY_ID);
      return stacks === 0 ? [] : [{ amount: takeOne(maxHealthShares, stacks - 1), attribute: Attribute.HealthPercent }];
    },
    getStrikeCriticalRateBonus: (strike, _enemy, _party, effects) =>
      strike.attackTag === AttackTag.ElementalBurst &&
      checkIsKitStatusActive(effects, strike.combatant.characterId, REMEDY_CRITICAL_RATE_ID)
        ? criticalRate
        : 0,
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind === KitEventKind.SkillUsed && event.characterId === characterId)
        addKitHold(kitEffectState, characterId, {
          id: REMEDY_ID,
          maximum: REMEDY_MAXIMUM_STACKS,
          seconds: skillSeconds,
        });
      if (event.kind !== KitEventKind.HealthChanged) return;
      if (event.characterId === characterId && event.bondOfLifeShare > 0)
        addKitHold(kitEffectState, characterId, {
          id: REMEDY_ID,
          maximum: REMEDY_MAXIMUM_STACKS,
          seconds: bondOfLifeSeconds,
        });
      if (event.sourceCharacterId === characterId && event.healthShare > 0)
        addKitHold(kitEffectState, characterId, {
          id: REMEDY_ID,
          maximum: REMEDY_MAXIMUM_STACKS,
          seconds: healSeconds,
        });
    },
    onStep: ({ kitEffectState }, { characterId }) => {
      if (countKitHolds(kitEffectState.effects, characterId, REMEDY_ID) >= REMEDY_MAXIMUM_STACKS) {
        addKitStatus(kitEffectState, characterId, {
          id: REMEDY_CRITICAL_RATE_ID,
          secondsRemaining: Number.POSITIVE_INFINITY,
        });
        return;
      }
      // Falling under three stacks starts the grace, which a status held at no end is given once it does
      const status = findKitStatus(kitEffectState.effects, characterId, REMEDY_CRITICAL_RATE_ID);
      if (status?.secondsRemaining === Number.POSITIVE_INFINITY) status.secondsRemaining = graceSeconds;
    },
  };
};
