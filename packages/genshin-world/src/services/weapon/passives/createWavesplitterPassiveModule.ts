import type { KitEffect } from "#src/models/kit/KitEffect";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { checkHasKitField } from "#src/services/kit/effects/checkHasKitField";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { takeOne } from "@esposter/shared";

const WAVESPLITTER_ID = "wavesplitter";
const WAVESPLITTER_CLOCK_ID = "wavesplitterClock";
// The most stacks Wavesplitter holds, as its text gives
const WAVESPLITTER_MAXIMUM_STACKS = 5;

const countWavesplitterStacks = (effects: KitEffect[], characterId: number): number =>
  findKitStatus(effects, characterId, WAVESPLITTER_ID)?.stacks ?? 0;

// Wavesplitter at its rank: a clock ticks every interval from the start of the battle, and on each tick its wielder is on the
// Field, she gains a stack, up to five. Each stack raises the DMG she deals by the rank's first share and the DMG she takes by
// Its second. A DMG taken takes one stack away. The stacks stay when she leaves the field, and a tick counts only while she is on it
export const createWavesplitterPassiveModule = (params: number[]): PassiveModule => {
  const intervalSeconds = takeOne(params, 0);
  const damageBonus = takeOne(params, 1);
  const damageTakenBonus = takeOne(params, 2);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) => {
      const stacks = countWavesplitterStacks(effects, characterId);
      if (stacks === 0) return [];
      return [
        { amount: stacks * damageBonus, attribute: Attribute.AllDamageBonus },
        { amount: -stacks * damageTakenBonus, attribute: Attribute.DamageReduction },
      ];
    },
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind !== KitEventKind.HealthChanged || event.characterId !== characterId || event.healthShare >= 0)
        return;
      addKitStatus(kitEffectState, characterId, {
        id: WAVESPLITTER_ID,
        secondsRemaining: Number.POSITIVE_INFINITY,
        stacks: Math.max(0, countWavesplitterStacks(kitEffectState.effects, characterId) - 1),
      });
    },
    onStep: ({ kitEffectState }, { characterId }) => {
      // The clock is cast once, so a step that finds it standing casts nothing, as a field restarts by its id
      if (checkHasKitField(kitEffectState.effects, characterId, WAVESPLITTER_CLOCK_ID)) return;
      castKitField(
        kitEffectState,
        characterId,
        { x: 0, z: 0 },
        {
          id: WAVESPLITTER_CLOCK_ID,
          nextTickSeconds: intervalSeconds,
          onTick: ({ activeCombatant, kitEffectState: tickKitEffectState }) => {
            const stacks = countWavesplitterStacks(tickKitEffectState.effects, characterId);
            if (activeCombatant.characterId !== characterId || stacks >= WAVESPLITTER_MAXIMUM_STACKS) return;
            addKitStatus(tickKitEffectState, characterId, {
              id: WAVESPLITTER_ID,
              secondsRemaining: Number.POSITIVE_INFINITY,
              stacks: stacks + 1,
            });
          },
          secondsRemaining: Number.POSITIVE_INFINITY,
          tickIntervalSeconds: intervalSeconds,
        },
      );
    },
  };
};
