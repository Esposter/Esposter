import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { exitKitNightsoulBlessing } from "#src/services/kit/effects/exitKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";

export const MUALANI_CHARACTER_ID = 10_000_102;

// Her Nightsoul points are set to 60 as her blessing is entered, and her blessing drains one a sixth of a second, ten a
// Second, as gcsim (MIT) mualani/skill.go reduceNightsoulPoints does
const NIGHTSOUL_POINTS = 60;
const NIGHTSOUL_DRAIN_PER_SECOND = 10;

// Natlan's Greatest Guide, her fourth ascension: each Nightsoul Burst a party member triggers stacks Wavechaser's Exploits, up to
// Three, and her burst spends them as it casts, each adding a share of her Max HP to its damage as the hit prices, as gcsim's
// (MIT) asc.go and burst.go do. The spent stacks wait on their own status for the burst's three seconds, its hit landing within them
const ASCENSION_4 = 4;
const WAVECHASER_EXPLOITS_ID = "mualani-wavechaser-exploits";
const WAVECHASER_EXPLOITS_MAXIMUM = 3;
const BOOMSHARKA_EXPLOITS_ID = "mualani-boomsharka-exploits";
const BOOMSHARKA_EXPLOITS_SECONDS = 3;
const EXPLOIT_MAX_HEALTH_SHARE = 0.15;

// Mualani's behaviour: her skill's press enters the Nightsoul Blessing with its points, which drain ten a second, or leaves
// It when she is in it, as gcsim's Skill does. Not built: the blessing's Sharky's Bite, so the press has no hit, and its
// Cooldown, which runs from the press where gcsim runs it from the blessing's end, and the cooldown her leaving sets, which
// The kit does not hold. Her strikes, charged attack and plunges are her record's alone, and she has no plunge in gcsim, so
// Each plunge hits as its action starts
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/mualani
// Constellation 1 needs the first Surfing Bite of the Nightsoul's Blessing, which the kit does not build
// Constellation 2 needs the Wave Momentum stacks and Puffers, which the kit does not build
// Constellation 4 needs Puffers and the Energy they restore, which the kit does not build
// Constellation 6 needs Constellation 1's increase, which the kit does not build
export const createMualaniKitBehaviour = (): KitBehaviour => ({
  burst: {
    onStart: ({ activeCombatant, kitEffectState }) => {
      const { ascension, characterId } = activeCombatant;
      if (ascension < ASCENSION_4) return;
      const stacks = findKitStatus(kitEffectState.effects, characterId, WAVECHASER_EXPLOITS_ID)?.stacks ?? 0;
      if (stacks === 0) return;
      addKitStatus(kitEffectState, characterId, {
        id: BOOMSHARKA_EXPLOITS_ID,
        secondsRemaining: BOOMSHARKA_EXPLOITS_SECONDS,
        stacks,
      });
      addKitStatus(kitEffectState, characterId, {
        id: WAVECHASER_EXPLOITS_ID,
        secondsRemaining: Number.POSITIVE_INFINITY,
        stacks: 0,
      });
    },
  },
  getStrikeAdditiveBaseDamageBonus: (strike, _enemy, _party, effects) => {
    if (strike.attackTag !== AttackTag.ElementalBurst) return 0;
    const stacks = findKitStatus(effects, strike.combatant.characterId, BOOMSHARKA_EXPLOITS_ID)?.stacks ?? 0;
    return stacks * EXPLOIT_MAX_HEALTH_SHARE * strike.combatant.attributes.maxHealth;
  },
  onKitEvent: (event, { kitEffectState }, combatant) => {
    if (event.kind !== KitEventKind.NightsoulBurst || combatant.ascension < ASCENSION_4) return;
    const { characterId } = combatant;
    const stacks = findKitStatus(kitEffectState.effects, characterId, WAVECHASER_EXPLOITS_ID)?.stacks ?? 0;
    addKitStatus(kitEffectState, characterId, {
      id: WAVECHASER_EXPLOITS_ID,
      secondsRemaining: Number.POSITIVE_INFINITY,
      stacks: Math.min(stacks + 1, WAVECHASER_EXPLOITS_MAXIMUM),
    });
  },
  skill: {
    onStart: ({ activeCombatant, kitEffectState }) => {
      const { characterId } = activeCombatant;
      if (hasKitNightsoulBlessing(kitEffectState.effects, characterId))
        exitKitNightsoulBlessing(kitEffectState, characterId);
      else
        enterKitNightsoulBlessing(kitEffectState, characterId, {
          nightsoulRate: { maximum: NIGHTSOUL_POINTS, perSecond: -NIGHTSOUL_DRAIN_PER_SECOND },
          points: NIGHTSOUL_POINTS,
          secondsRemaining: Number.POSITIVE_INFINITY,
        });
    },
  },
});
