import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { extendKitStatus } from "#src/services/kit/effects/extendKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

const LAWS_OF_THE_BOARD_ID = "lawsOfTheBoard";
const LAWS_OF_THE_BOARD_COOLDOWN_ID = "lawsOfTheBoardCooldown";

// Without Heed for Day nor Night (Clash of Kings) at its rank: an Elemental Skill its wielder uses gives Laws of the
// Board for the rank's seconds, once every cooldown, raising its ATK and Elemental Mastery by the rank's amounts, and a
// Charged Attack hit it lands while the Laws hold extends them by the rank's extension, which is also their most. gcsim
// V2.47.2 has no Clash of Kings, so the reading is the text's
export const createWithoutHeedForDayNorNightPassiveModule = (params: number[]): PassiveModule => {
  const attackPercent = takeOne(params, 0);
  const elementalMastery = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  const extensionSeconds = takeOne(params, 4);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) =>
      checkIsKitStatusActive(effects, characterId, LAWS_OF_THE_BOARD_ID)
        ? [
            { amount: attackPercent, attribute: Attribute.AttackPercent },
            { amount: elementalMastery, attribute: Attribute.ElementalMastery },
          ]
        : [],
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (
        event.kind === KitEventKind.SkillUsed &&
        event.characterId === characterId &&
        startKitCooldown(kitEffectState, characterId, LAWS_OF_THE_BOARD_COOLDOWN_ID, cooldownSeconds)
      )
        addKitStatus(kitEffectState, characterId, { id: LAWS_OF_THE_BOARD_ID, secondsRemaining: seconds });
      else if (
        event.kind === KitEventKind.EnemyHit &&
        event.striker.characterId === characterId &&
        event.attackTag === AttackTag.ChargedAttack
      )
        extendKitStatus(kitEffectState, characterId, LAWS_OF_THE_BOARD_ID, {
          maximumSeconds: extensionSeconds,
          seconds: extensionSeconds,
        });
    },
  };
};
