import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const WHITEHILLS_BESTOWAL_ID = "whitehillsBestowal";

// Whitehill's Bestowal (Azurelight) at its rank: for the rank's seconds after its wielder uses an Elemental Skill, its
// ATK rises by the rank's amount, and while it holds no Energy by the rank's further ATK and CRIT DMG, read live from
// The Energy it holds, as gcsim's azurelight.go reads the character's Energy in its stat mod
export const createWhitehillsBestowalPassiveModule = (params: number[]): PassiveModule => {
  const attackPercent = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const emptyAttackPercent = takeOne(params, 2);
  const emptyCriticalDamage = takeOne(params, 3);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, deployedCombatants, effects) => {
      if (!checkIsKitStatusActive(effects, characterId, WHITEHILLS_BESTOWAL_ID)) return [];
      const isEmpty = deployedCombatants.find((member) => member.characterId === characterId)?.energy === 0;
      return [
        { amount: attackPercent + (isEmpty ? emptyAttackPercent : 0), attribute: Attribute.AttackPercent },
        { amount: isEmpty ? emptyCriticalDamage : 0, attribute: Attribute.CriticalDamage },
      ];
    },
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind !== KitEventKind.SkillUsed || event.characterId !== characterId) return;
      addKitStatus(kitEffectState, characterId, { id: WHITEHILLS_BESTOWAL_ID, secondsRemaining: seconds });
    },
  };
};
