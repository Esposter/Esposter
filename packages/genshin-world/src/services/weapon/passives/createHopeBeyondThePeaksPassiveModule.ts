import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const HOPE_BEYOND_THE_PEAKS_ID = "hopeBeyondThePeaks";

// Hope Beyond the Peaks at its rank: its wielder's Elemental Skill DMG is raised by the rank's amount, and by the
// Rank's Second amount more for its seconds after another member of the deployed team uses an Elemental Skill. Its
// Climbing Stamina Line, the first param, is not read
export const createHopeBeyondThePeaksPassiveModule = (params: number[]): PassiveModule => {
  const skillDamageBonus = takeOne(params, 1);
  const otherMemberSkillDamageBonus = takeOne(params, 2);
  const seconds = takeOne(params, 3);
  return {
    getStrikeDamageBonus: (strike, _enemy, _party, effects) => {
      if (strike.attackTag !== AttackTag.ElementalSkill) return 0;
      return (
        skillDamageBonus +
        (checkIsKitStatusActive(effects, strike.combatant.characterId, HOPE_BEYOND_THE_PEAKS_ID)
          ? otherMemberSkillDamageBonus
          : 0)
      );
    },
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.SkillUsed || event.characterId === combatant.characterId) return;
      addKitStatus(kitEffectState, combatant.characterId, { id: HOPE_BEYOND_THE_PEAKS_ID, secondsRemaining: seconds });
    },
  };
};
