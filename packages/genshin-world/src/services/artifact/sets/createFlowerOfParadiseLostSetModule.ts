import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ReactionType } from "#src/models/combat/ReactionType";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { takeOne } from "@esposter/shared";

const FLOWER_OF_PARADISE_LOST_STACKS_ID = "flowerOfParadiseLostStacks";
const FLOWER_OF_PARADISE_LOST_COOLDOWN_ID = "flowerOfParadiseLostCooldown";

// Flower of Paradise Lost's four-piece. Its first three params raise the DMG its wearer's own Bloom, Hyperbloom and Burgeon deal, and
// Its eighth the DMG its own Lunar-Bloom deals. Each of those reactions the wearer triggers gains a stack, up to the fifth param, which
// Raises those bonuses by the sixth param of each once more a stack, for the fourth param's seconds from the last stack. A stack is
// Gained at most once in the seventh param's seconds, and a Bloom a gadget triggers gains none, as gcsim's noGadget takes Bloom alone;
// The rest count from any source, and the stacks count while the wearer is off the field, as the text says
export const createFlowerOfParadiseLostSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const baseDamageBonusMap = new Map<ReactionType, number>([
    [LunarReactionType.LunarBloom, takeOne(bonus.params, 7)],
    [TransformativeReactionType.Bloom, takeOne(bonus.params, 0)],
    [TransformativeReactionType.Burgeon, takeOne(bonus.params, 2)],
    [TransformativeReactionType.Hyperbloom, takeOne(bonus.params, 1)],
  ]);
  const stackSeconds = takeOne(bonus.params, 3);
  const maximumStacks = takeOne(bonus.params, 4);
  const stackDamageRatio = takeOne(bonus.params, 5);
  const cooldownSeconds = takeOne(bonus.params, 6);
  return {
    getPartyReactionBonus: (member, { combatant, reactionType }, context) => {
      const baseDamageBonus = baseDamageBonusMap.get(reactionType);
      if (member.characterId !== combatant.characterId || baseDamageBonus === undefined) return {};
      const stacks =
        findKitStatus(context.kitEffectState.effects, combatant.characterId, FLOWER_OF_PARADISE_LOST_STACKS_ID)
          ?.stacks ?? 0;
      return { damageBonus: baseDamageBonus * (1 + stackDamageRatio * stacks) };
    },
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered || event.striker.characterId !== combatant.characterId) return;
      const { characterId } = combatant;
      const triggersStack = event.reactions.some(
        ({ reactionType }) =>
          baseDamageBonusMap.has(reactionType) &&
          !(reactionType === TransformativeReactionType.Bloom && event.isGadget),
      );
      if (!triggersStack) return;
      if (checkIsKitStatusActive(kitEffectState.effects, characterId, FLOWER_OF_PARADISE_LOST_COOLDOWN_ID)) return;
      addKitStatus(kitEffectState, characterId, {
        id: FLOWER_OF_PARADISE_LOST_COOLDOWN_ID,
        secondsRemaining: cooldownSeconds,
      });
      const stacks = Math.min(
        (findKitStatus(kitEffectState.effects, characterId, FLOWER_OF_PARADISE_LOST_STACKS_ID)?.stacks ?? 0) + 1,
        maximumStacks,
      );
      addKitStatus(kitEffectState, characterId, {
        id: FLOWER_OF_PARADISE_LOST_STACKS_ID,
        secondsRemaining: stackSeconds,
        stacks,
      });
    },
  };
};
