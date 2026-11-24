import type { ReactionType } from "#src/models/combat/ReactionType";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";
import { takeOne } from "@esposter/shared";

// A passive that raises the DMG of two reactions its party makes: the first by the rank's first amount, and the second
// By the rank's second amount, plus the rank's third amount under Ascendant Gleam. Swift and Sure and Token of Covenant
// Share it
export const createReactionDamageBonusPassiveModule = (
  params: number[],
  { firstReactionType, secondReactionType }: { firstReactionType: ReactionType; secondReactionType: ReactionType },
): PassiveModule => {
  const firstAmount = takeOne(params, 0);
  const secondAmount = takeOne(params, 1);
  const ascendantGleamAmount = takeOne(params, 2);
  return {
    getPartyReactionBonus: (_member, { reactionType }, context) => {
      if (reactionType === firstReactionType) return { damageBonus: firstAmount };
      if (reactionType !== secondReactionType) return {};
      const isAscendantGleam =
        getMoonsignLevel(context.characterIdCombatantMap, context.party) === MoonsignLevel.AscendantGleam;
      return { damageBonus: isAscendantGleam ? secondAmount + ascendantGleamAmount : secondAmount };
    },
  };
};
