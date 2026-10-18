import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { drainKitNightsoulPoints } from "#src/services/kit/effects/drainKitNightsoulPoints";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { exitKitNightsoulBlessing } from "#src/services/kit/effects/exitKitNightsoulBlessing";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";

export const CHASCA_CHARACTER_ID = 10_000_104;

// Her blessing starts with 80 points, which drain eight a second, 0.8 each six frames, and a sprint in it drains 13.3
// More, as gcsim (MIT) chasca/skill.go enterNightsoul and reduceNightsoulPoints and chasca/dash.go do
const NIGHTSOUL_POINTS = 80;
const NIGHTSOUL_DRAIN_PER_SECOND = 8;
const NIGHTSOUL_SPRINT_DRAIN = 13.3;

// Chasca's behaviour: her skill's press enters the Nightsoul Blessing, which drains its points as gcsim does, and a press
// In it leaves the Blessing, and a sprint in it drains points. Not built: the Resonance strike on the press that leaves
// The Blessing, which gcsim's exit press does not deal, since the kit plays one action per press and Resonance's hit is
// Its action's own. Also not built: the Radiant and Soulseeker shells after Galesplitting, the Ascension talent's Burning
// Shadowhunt Shell, and the Constellations that need the shells
// Constellation 1 needs Bullet Trick's Spiritbinding Conversion, which the Ascension talent does not build
// Constellation 2 needs Bullet Trick's Spirit of the Radiant Shadow stacks, which the Ascension talent does not build
// Constellation 4 needs the Radiant Soulseeker Shells after Galesplitting, which are not built
// Constellation 6 needs Multitarget Fire's charge time and Bullet Trick's Spiritbinding Conversion, neither built
export const createChascaKitBehaviour = (): KitBehaviour => ({
  onSprint: ({ activeCombatant, kitEffectState }) => {
    const { characterId } = activeCombatant;
    if (hasKitNightsoulBlessing(kitEffectState.effects, characterId))
      drainKitNightsoulPoints(kitEffectState, characterId, NIGHTSOUL_SPRINT_DRAIN);
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
