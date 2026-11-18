import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { EMBLEM_MAXIMUM_STACKS } from "#src/services/weapon/passives/constants";
import { countEmblemStacks } from "#src/services/weapon/passives/countEmblemStacks";
import { syncEmblemEnergyStack } from "#src/services/weapon/passives/syncEmblemEnergyStack";
import { takeOne } from "@esposter/shared";

const THUNDER_EMBLEM_ID = "thunderEmblem";

// Rule by Thunder at its rank: the Thunder Emblem raises its wielder's Normal Attack DMG by the rank's amount for one, two or
// Three stacks, read from the params after its ATK, which is a table line. A stack is held by a normal attack's hit for the
// Rank's fifth seconds, by an Elemental Skill the wielder uses for its sixth, and by an Energy short of full until it is full
export const createRuleByThunderPassiveModule = (params: number[]): PassiveModule => {
  const normalAttackSeconds = takeOne(params, 4);
  const skillSeconds = takeOne(params, 5);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) => {
      const stacks = countEmblemStacks(effects, characterId, THUNDER_EMBLEM_ID);
      return stacks === 0 ? [] : [{ amount: takeOne(params, stacks), attribute: Attribute.NormalAttackDamageBonus }];
    },
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      const seconds =
        event.kind === KitEventKind.DamageTaken &&
        event.striker.characterId === characterId &&
        event.attackTag === AttackTag.NormalAttack
          ? normalAttackSeconds
          : event.kind === KitEventKind.SkillUsed && event.characterId === characterId
            ? skillSeconds
            : undefined;
      if (seconds !== undefined)
        addKitHold(kitEffectState, characterId, { id: THUNDER_EMBLEM_ID, maximum: EMBLEM_MAXIMUM_STACKS, seconds });
    },
    onStep: ({ kitEffectState, party }, combatant) => {
      syncEmblemEnergyStack(kitEffectState, party, combatant, THUNDER_EMBLEM_ID);
    },
  };
};
