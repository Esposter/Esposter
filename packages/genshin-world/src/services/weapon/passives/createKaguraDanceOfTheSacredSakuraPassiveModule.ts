import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { countKitStatusStacks } from "#src/services/kit/effects/countKitStatusStacks";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { takeOne } from "@esposter/shared";

const KAGURA_DANCE_ID = "kaguraDance";
const KAGURA_DANCE_MAXIMUM_STACKS = 3;

// Kagura Dance of the Sacred Sakura (Kagura's Verity) at its rank: each Elemental Skill its wielder uses adds a
// Stack of the Kagura Dance, up to three, and restarts the rank's seconds for them all, as gcsim's kagura.go starts
// Them from one once they lapse. Each stack raises the wielder's Elemental Skill DMG and its own Stellar-Conduct DMG
// By the rank's amounts, and three give the rank's DMG Bonus of every Element. The maximum stacks are the text's
export const createKaguraDanceOfTheSacredSakuraPassiveModule = (params: number[]): PassiveModule => {
  const skillDamageBonusPerStack = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const stellarConductDamageBonusPerStack = takeOne(params, 2);
  const elementalDamageBonus = takeOne(params, 3);
  return {
    getPartyReactionBonus: (member, { combatant, reactionType }, { kitEffectState }) =>
      combatant.characterId === member.characterId && reactionType === StellarReactionType.StellarConduct
        ? {
            damageBonus:
              stellarConductDamageBonusPerStack *
              countKitStatusStacks(kitEffectState.effects, member.characterId, KAGURA_DANCE_ID),
          }
        : {},
    getStrikeDamageBonus: ({ attackTag, combatant }, _enemy, _party, effects) =>
      attackTag === AttackTag.ElementalSkill
        ? skillDamageBonusPerStack * countKitStatusStacks(effects, combatant.characterId, KAGURA_DANCE_ID)
        : 0,
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind !== KitEventKind.SkillUsed || event.characterId !== characterId) return;
      const stacks = Math.min(
        countKitStatusStacks(kitEffectState.effects, characterId, KAGURA_DANCE_ID) + 1,
        KAGURA_DANCE_MAXIMUM_STACKS,
      );
      addKitStatus(kitEffectState, characterId, { id: KAGURA_DANCE_ID, secondsRemaining: seconds, stacks });
      if (stacks < KAGURA_DANCE_MAXIMUM_STACKS) return;
      for (const attribute of ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES)
        buffKitMember(kitEffectState, characterId, {
          amount: elementalDamageBonus,
          attribute,
          secondsRemaining: seconds,
          source: KAGURA_DANCE_ID,
        });
    },
  };
};
