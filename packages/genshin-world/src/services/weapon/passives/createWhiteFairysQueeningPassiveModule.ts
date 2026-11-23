import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { checkIsOwnDamageTaken } from "#src/services/kit/checkIsOwnDamageTaken";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { countKitStatusStacks } from "#src/services/kit/effects/countKitStatusStacks";
import { checkIsReactionNamed } from "#src/services/weapon/passives/checkIsReactionNamed";
import { takeOne } from "@esposter/shared";

const TRANSCENDENCE_ID = "transcendence";
const TRANSCENDENCE_STACK_COOLDOWN_SECONDS = 0.2;
const MAXIMUM_STACKS = 3;
const STELLAR_REACTIONS = [{ reactionType: ReactionType.StellarConduct }, { reactionType: ReactionType.StellarSwirl }];

// White Fairy's Queening at its rank: its ATK is a static line. Each Charged Attack hit its wielder lands gives a stack
// Of Transcendence, once every 0.2 seconds and up to three, each raising the Stellar-Conduct and Stellar Swirl DMG the
// Wielder Triggers by the rank's amount for the rank's seconds
export const createWhiteFairysQueeningPassiveModule = (params: number[]): PassiveModule => {
  const damageBonusPerStack = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  return {
    getPartyReactionBonus: (member, reaction, context) => {
      const stacks = countKitStatusStacks(context.kitEffectState.effects, member.characterId, TRANSCENDENCE_ID);
      return reaction.combatant.characterId === member.characterId &&
        stacks > 0 &&
        checkIsReactionNamed([reaction], STELLAR_REACTIONS)
        ? { damageBonus: damageBonusPerStack * stacks }
        : {};
    },
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (!checkIsOwnDamageTaken(event, combatant) || event.attackTag !== AttackTag.ChargedAttack) return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        cooldownSeconds: TRANSCENDENCE_STACK_COOLDOWN_SECONDS,
        id: TRANSCENDENCE_ID,
        maximumStacks: MAXIMUM_STACKS,
        seconds,
      });
    },
  };
};
