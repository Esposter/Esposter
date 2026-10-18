import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { checkIsReactionNamed } from "#src/services/weapon/passives/checkIsReactionNamed";
import { takeOne } from "@esposter/shared";

const CANOPYS_FAVOR_ID = "canopysFavor";
const REACTION_COOLDOWN_ID = "turquoiseHuntReactionCooldown";
const SKILL_COOLDOWN_ID = "turquoiseHuntSkillCooldown";
// The stacks a nearby party member's reaction gives, which the text states rather than the rank's numbers
const REACTION_STACKS = 3;
const CANOPY_REACTIONS = [{ reactionType: ReactionType.Burning }, { reactionType: ReactionType.Burgeon }];

// Turquoise Hunt at its rank: an Elemental Skill its wielder hits with gains a stack of Canopy's Favor, once every skill
// Cooldown; a Burning or Burgeon a nearby party member triggers gives it three, once every reaction cooldown, whether or not
// That member is on the field. Each stack raises its Elemental Skill and Burst DMG by the rank's share for its seconds, up to
// The rank's maximum, and each stack runs its own seconds
export const createTurquoiseHuntPassiveModule = (params: number[]): WeaponPassiveModule => {
  const skillCooldownSeconds = takeOne(params, 0);
  const reactionCooldownSeconds = takeOne(params, 1);
  const damageBonusPerStack = takeOne(params, 2);
  const stackSeconds = takeOne(params, 3);
  const maximumStacks = takeOne(params, 4);
  return {
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      strike.attackTag === AttackTag.ElementalSkill || strike.attackTag === AttackTag.ElementalBurst
        ? damageBonusPerStack * countKitHolds(effects, strike.combatant.characterId, CANOPYS_FAVOR_ID)
        : 0,
    onKitEvent: (event, { kitEffectState }, combatant) => {
      const { characterId } = combatant;
      if (
        event.kind === KitEventKind.DamageTaken &&
        event.striker.characterId === characterId &&
        event.attackTag === AttackTag.ElementalSkill &&
        !checkIsKitStatusActive(kitEffectState.effects, characterId, SKILL_COOLDOWN_ID)
      ) {
        addKitStatus(kitEffectState, characterId, { id: SKILL_COOLDOWN_ID, secondsRemaining: skillCooldownSeconds });
        addKitHold(kitEffectState, characterId, {
          id: CANOPYS_FAVOR_ID,
          maximum: maximumStacks,
          seconds: stackSeconds,
        });
      } else if (
        event.kind === KitEventKind.ReactionTriggered &&
        event.striker.characterId !== characterId &&
        checkIsReactionNamed(event.reactions, CANOPY_REACTIONS) &&
        !checkIsKitStatusActive(kitEffectState.effects, characterId, REACTION_COOLDOWN_ID)
      ) {
        addKitStatus(kitEffectState, characterId, {
          id: REACTION_COOLDOWN_ID,
          secondsRemaining: reactionCooldownSeconds,
        });
        for (let stack = 0; stack < REACTION_STACKS; stack++)
          addKitHold(kitEffectState, characterId, {
            id: CANOPYS_FAVOR_ID,
            maximum: maximumStacks,
            seconds: stackSeconds,
          });
      }
    },
  };
};
