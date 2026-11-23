import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitStatusStacks } from "#src/services/kit/effects/countKitStatusStacks";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { checkIsReactionNamed } from "#src/services/weapon/passives/checkIsReactionNamed";
import { takeOne } from "@esposter/shared";

const SCORCHING_SUMMER_ID = "scorchingSummer";
const SKILL_COOLDOWN_ID = "aquaRemembranceSkillCooldown";
const LOSE_STACK_COOLDOWN_ID = "aquaRemembranceLoseStackCooldown";
const GAIN_STACK_COOLDOWN_ID = "aquaRemembranceGainStackCooldown";
const VAPORIZE_REACTIONS = [{ reactionType: ReactionType.Vaporize }];

// Aqua Remembrance at its rank: its Max HP is a static line. Once every the rank's cooldown, its wielder's Elemental
// Skill gives Four Scorching Summer stacks for the rank's seconds, each raising its Normal Attack DMG by the rank's
// Amount. A Normal Attack Hit loses a stack, and a Vaporize the wielder triggers gains one, each once every the rank's
// Cooldown in seconds, up to the Rank's stacks
export const createAquaRemembrancePassiveModule = (params: number[]): PassiveModule => {
  const cooldownSeconds = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  const maximumStacks = takeOne(params, 3);
  const damageBonusPerStack = takeOne(params, 4);
  const loseCooldownSeconds = takeOne(params, 5);
  const stacksPerChange = takeOne(params, 6);
  const gainCooldownSeconds = takeOne(params, 7);
  const changeStacks = (kitEffectState: KitEffectState, characterId: number, change: number) => {
    const status = findKitStatus(kitEffectState.effects, characterId, SCORCHING_SUMMER_ID);
    if (status) status.stacks = Math.min(maximumStacks, Math.max(0, (status.stacks ?? 0) + change));
  };
  return {
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      strike.attackTag === AttackTag.NormalAttack
        ? damageBonusPerStack * countKitStatusStacks(effects, strike.combatant.characterId, SCORCHING_SUMMER_ID)
        : 0,
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { kitEffectState } = context;
      if (event.kind === KitEventKind.SkillUsed) {
        if (
          event.characterId === characterId &&
          startKitCooldown(kitEffectState, characterId, SKILL_COOLDOWN_ID, cooldownSeconds)
        )
          addKitStatus(kitEffectState, characterId, {
            id: SCORCHING_SUMMER_ID,
            secondsRemaining: seconds,
            stacks: maximumStacks,
          });
      } else if (
        event.kind === KitEventKind.DamageTaken &&
        event.striker.characterId === characterId &&
        event.attackTag === AttackTag.NormalAttack &&
        checkIsKitStatusActive(kitEffectState.effects, characterId, SCORCHING_SUMMER_ID) &&
        startKitCooldown(kitEffectState, characterId, LOSE_STACK_COOLDOWN_ID, loseCooldownSeconds)
      )
        changeStacks(kitEffectState, characterId, -stacksPerChange);
      else if (
        event.kind === KitEventKind.ReactionTriggered &&
        event.striker.characterId === characterId &&
        checkIsReactionNamed(event.reactions, VAPORIZE_REACTIONS) &&
        checkIsKitStatusActive(kitEffectState.effects, characterId, SCORCHING_SUMMER_ID) &&
        startKitCooldown(kitEffectState, characterId, GAIN_STACK_COOLDOWN_ID, gainCooldownSeconds)
      )
        changeStacks(kitEffectState, characterId, stacksPerChange);
    },
  };
};
