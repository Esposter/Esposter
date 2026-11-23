import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ElementDamageBonusAttributeMap } from "#src/services/combat/damage/ElementDamageBonusAttributeMap";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES, EMBLEM_MAXIMUM_STACKS } from "#src/services/weapon/passives/constants";
import { countEmblemStacks } from "#src/services/weapon/passives/countEmblemStacks";
import { syncEmblemEnergyStack } from "#src/services/weapon/passives/syncEmblemEnergyStack";
import { takeOne } from "@esposter/shared";

const MISTSPLITTERS_EMBLEM_ID = "mistsplittersEmblem";

// Mistsplitter's Edge at its rank: its wielder's Elemental DMG Bonus rises on every element by the rank's first amount,
// And Its Emblem's stacks raise its element's by the amount their count gives, one, two or three stacks reading the
// Params after The first. A stack is held by a normal attack's elemental hit for the rank's fifth seconds, by a burst
// For its sixth, and by An Energy short of full, which holds one until the Energy is full
export const createMistsplittersEdgePassiveModule = (params: number[]): PassiveModule => {
  const elementalDamageBonus = takeOne(params, 0);
  const normalAttackSeconds = takeOne(params, 4);
  const burstSeconds = takeOne(params, 5);
  return {
    getPassiveBonuses: ({ characterId, element }, _healthShare, _deployedCombatants, effects) => {
      const bonuses = ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({
        amount: elementalDamageBonus,
        attribute,
      }));
      const stacks = countEmblemStacks(effects, characterId, MISTSPLITTERS_EMBLEM_ID);
      if (stacks === 0 || element === undefined) return bonuses;
      return [...bonuses, { amount: takeOne(params, stacks), attribute: ElementDamageBonusAttributeMap[element] }];
    },
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (
        event.kind === KitEventKind.EnemyHit &&
        event.striker.characterId === characterId &&
        event.attackTag === AttackTag.NormalAttack &&
        event.element !== undefined
      )
        addKitHold(kitEffectState, characterId, {
          id: MISTSPLITTERS_EMBLEM_ID,
          maximum: EMBLEM_MAXIMUM_STACKS,
          seconds: normalAttackSeconds,
        });
      else if (event.kind === KitEventKind.BurstUsed && event.characterId === characterId)
        addKitHold(kitEffectState, characterId, {
          id: MISTSPLITTERS_EMBLEM_ID,
          maximum: EMBLEM_MAXIMUM_STACKS,
          seconds: burstSeconds,
        });
    },
    onStep: ({ kitEffectState, party }, combatant) => {
      syncEmblemEnergyStack(kitEffectState, party, combatant, MISTSPLITTERS_EMBLEM_ID);
    },
  };
};
