import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const LEGACY_OF_LANG_GAN_ID = "legacyOfLangGan";

// Legacy of Lang-Gan (Lightbearing Moonshard) at its rank. Its DEF line is the table's. For the rank's seconds after
// Its wielder uses an Elemental Skill, the Lunar-Crystallize DMG the wielder deals rises by the rank's amount, as
// Gcsim's lightbearingmoonshard.go adds a reaction bonus mod for its direct and reaction Lunar-Crystallize hits alike
export const createLegacyOfLangGanPassiveModule = (params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  return {
    getPartyReactionBonus: (member, { combatant, reactionType }, { kitEffectState }) =>
      combatant.characterId === member.characterId &&
      reactionType === LunarReactionType.LunarCrystallize &&
      checkIsKitStatusActive(kitEffectState.effects, member.characterId, LEGACY_OF_LANG_GAN_ID)
        ? { damageBonus }
        : {},
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind !== KitEventKind.SkillUsed || event.characterId !== characterId) return;
      addKitStatus(kitEffectState, characterId, { id: LEGACY_OF_LANG_GAN_ID, secondsRemaining: seconds });
    },
  };
};
