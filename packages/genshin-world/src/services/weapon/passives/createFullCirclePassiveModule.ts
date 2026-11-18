import type { KitEffect } from "#src/models/kit/KitEffect";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

const WAX_AND_WANE_ID = "waxAndWane";
const WAX_AND_WANE_COOLDOWN_ID = "waxAndWaneCooldown";
const WAX_AND_WANE_DECAY_ID = "waxAndWaneDecay";
// The most stacks Wax and Wane holds, as its text gives
const WAX_AND_WANE_MAXIMUM_STACKS = 5;

const countWaxAndWaneStacks = (effects: readonly KitEffect[], characterId: number): number =>
  findKitStatus(effects, characterId, WAX_AND_WANE_ID)?.stacks ?? 0;

// Full Circle at its rank: an Elemental Reaction, by any character, gains a stack of Wax and Wane, once every cooldown, up to
// Five. Each stack raises Elemental Mastery by the rank's first amount and lowers ATK by the second. Each decay seconds that go
// By without a reaction lose a stack, and a reaction restarts the count. The stacks count whether or not the wielder is on the field
export const createFullCirclePassiveModule = (params: number[]): PassiveModule => {
  const attackPercent = takeOne(params, 0);
  const elementalMastery = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  const decaySeconds = takeOne(params, 3);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) => {
      const stacks = countWaxAndWaneStacks(effects, characterId);
      if (stacks === 0) return [];
      return [
        { amount: stacks * elementalMastery, attribute: Attribute.ElementalMastery },
        { amount: stacks * attackPercent, attribute: Attribute.AttackPercent },
      ];
    },
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind === KitEventKind.ReactionTriggered) {
        addKitStatus(kitEffectState, characterId, { id: WAX_AND_WANE_DECAY_ID, secondsRemaining: decaySeconds });
        if (
          startKitCooldown(kitEffectState, characterId, WAX_AND_WANE_COOLDOWN_ID, cooldownSeconds) &&
          countWaxAndWaneStacks(kitEffectState.effects, characterId) < WAX_AND_WANE_MAXIMUM_STACKS
        )
          addKitStatus(kitEffectState, characterId, {
            id: WAX_AND_WANE_ID,
            secondsRemaining: Number.POSITIVE_INFINITY,
            stacks: countWaxAndWaneStacks(kitEffectState.effects, characterId) + 1,
          });
        return;
      }
      if (
        event.kind !== KitEventKind.EffectExpired ||
        event.effect.kind !== "status" ||
        event.effect.characterId !== characterId ||
        event.effect.id !== WAX_AND_WANE_DECAY_ID
      )
        return;
      const stacks = countWaxAndWaneStacks(kitEffectState.effects, characterId);
      if (stacks === 0) return;
      addKitStatus(kitEffectState, characterId, {
        id: WAX_AND_WANE_ID,
        secondsRemaining: Number.POSITIVE_INFINITY,
        stacks: stacks - 1,
      });
      if (stacks > 1)
        addKitStatus(kitEffectState, characterId, { id: WAX_AND_WANE_DECAY_ID, secondsRemaining: decaySeconds });
    },
  };
};
