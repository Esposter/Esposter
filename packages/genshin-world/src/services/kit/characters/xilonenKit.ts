import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { drainKitNightsoulPoints } from "#src/services/kit/effects/drainKitNightsoulPoints";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { exitKitNightsoulBlessing } from "#src/services/kit/effects/exitKitNightsoulBlessing";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";

export const XILONEN_CHARACTER_ID = 10_000_103;

// Her Blessing starts with 45 points, which drain five a second, and lasts nine seconds, and a sprint in it drains five
// More points, as gcsim (MIT) xilonen/skill.go enterNightsoul and nightsoulPointReduceTask and xilonen/dash.go do
const NIGHTSOUL_POINTS = 45;
const NIGHTSOUL_DRAIN_PER_SECOND = 5;
const NIGHTSOUL_SECONDS = 9;
const NIGHTSOUL_SPRINT_DRAIN = 5;

// Xilonen's behaviour: her skill's press enters the Nightsoul Blessing, which drains its points and ends after nine
// Seconds as gcsim does, a press in it leaves the Blessing, and a sprint in it drains points. Not built: the strike of the
// Press that leaves the Blessing, which gcsim's exit press does not deal, as Chasca's does not, and the Blade Roller strikes
// And charged attack the Blessing plays in place of her normal attacks, which need a variant the kit lacks. Ocelotlicue
// Point's damage is read only with fewer than two Samplers in the party, which a kit step cannot count yet, and its heal,
// Which it gives with two or more, is a timed heal that is not built either
// Constellation 1 needs the Blessing's point and Phlogiston cuts, which the kit does not build
// Constellation 2 needs the Geo Source Sample off the field and its party effect, which the kit does not build
// Constellation 4 needs Yohual's Scratch to grant the Blooming Blessing effect, which the kit does not build
// Constellation 6 needs the Nightsoul's Blessing extension by sprinting or attacking, which the kit does not build
export const createXilonenKitBehaviour = (): KitBehaviour => ({
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
          secondsRemaining: NIGHTSOUL_SECONDS,
        });
    },
  },
});
