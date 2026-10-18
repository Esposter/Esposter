import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { checkIsReactionNamed } from "#src/services/weapon/passives/checkIsReactionNamed";
import { takeOne } from "@esposter/shared";

const SECRET_OF_LIES_ID = "secretOfLies";
const MOON_OF_TRUTH_ID = "moonOfTruth";
const LUNAR_BLOOM_REACTIONS = [{ reactionType: ReactionType.LunarBloom }];

// Essence of Falsity at its rank: CRIT Rate rises by the rank's amount. An Elemental Skill its wielder uses gives it Secret of
// Lies, raising its Elemental Mastery by the first amount for the first seconds, and Lunar-Bloom DMG it deals gives it Moon of
// Truth, raising its CRIT DMG by the second amount for the second seconds. While both stand, each raise is increased by the
// Rank's last share, read from the effects as they stand, so ending either one drops the increase
export const createEssenceOfFalsityPassiveModule = (params: number[]): WeaponPassiveModule => {
  const elementalMastery = takeOne(params, 0);
  const criticalDamage = takeOne(params, 1);
  const secretOfLiesSeconds = takeOne(params, 2);
  const moonOfTruthSeconds = takeOne(params, 3);
  const bothIncrease = takeOne(params, 4);
  const criticalRate = takeOne(params, 5);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => {
      const isSecretOfLies = checkIsKitStatusActive(effects, combatant.characterId, SECRET_OF_LIES_ID);
      const isMoonOfTruth = checkIsKitStatusActive(effects, combatant.characterId, MOON_OF_TRUTH_ID);
      const increase = isSecretOfLies && isMoonOfTruth ? 1 + bothIncrease : 1;
      return [
        { amount: criticalRate, attribute: Attribute.CriticalRate },
        { amount: isSecretOfLies ? elementalMastery * increase : 0, attribute: Attribute.ElementalMastery },
        { amount: isMoonOfTruth ? criticalDamage * increase : 0, attribute: Attribute.CriticalDamage },
      ];
    },
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind === KitEventKind.SkillUsed && event.characterId === combatant.characterId)
        addKitStatus(kitEffectState, combatant.characterId, {
          id: SECRET_OF_LIES_ID,
          secondsRemaining: secretOfLiesSeconds,
        });
      else if (
        event.kind === KitEventKind.ReactionTriggered &&
        event.striker.characterId === combatant.characterId &&
        checkIsReactionNamed(event.reactions, LUNAR_BLOOM_REACTIONS)
      )
        addKitStatus(kitEffectState, combatant.characterId, {
          id: MOON_OF_TRUTH_ID,
          secondsRemaining: moonOfTruthSeconds,
        });
    },
  };
};
