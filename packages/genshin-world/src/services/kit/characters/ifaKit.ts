import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { exitKitNightsoulBlessing } from "#src/services/kit/effects/exitKitNightsoulBlessing";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";

export const IFA_CHARACTER_ID = 10_000_113;

// Her Nightsoul points are set to 80 as her blessing is entered, as gcsim (MIT) ifa/skill.go enterNightsoul sets them
const NIGHTSOUL_POINTS = 80;
// Her blessing drains 0.8 points every six frames, eight a second, as gcsim ifa/skill.go nightsoulPointReduceFunc does
const NIGHTSOUL_DRAIN_PER_SECOND = 8;

// Ifa's behaviour: her skill's press enters the Nightsoul Blessing with its points, which drain eight a second, or leaves
// It when she is in it, as gcsim's Skill does. Not built: her Tonic Shot, healing, sedation marks, passives and
// Constellations, which wait on the Nightsoul hook and the sedation-mark hook, the cooldown her leaving sets, which the kit
// Does not hold, and the hold that plunges from inside the blessing. Her three normal attacks, charged attack, Compound
// Sedation Field's hit, and her low and collision plunges are her record's alone, and her high plunge is borrowed as the
// Page records. The low plunge, which gcsim plays only after the Nightsoul Blessing ends, is not gated
export const createIfaKitBehaviour = (): KitBehaviour => ({
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
