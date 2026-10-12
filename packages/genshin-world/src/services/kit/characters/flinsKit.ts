import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { enterKitStance } from "#src/services/kit/effects/enterKitStance";

export const FLINS_CHARACTER_ID = 10_000_120;

// Flins's behaviour: Manifest Flame's press plays no hit of its own, as gcsim's Arcane Light deals no damage; it starts a
// Stance for the Manifest Flame's seconds, ending as he leaves the field, whose strikes and charged attack are the Electro
// Ones. Not built yet: Thunderous Symphony, the burst Northland Spearstorm arms for six seconds, whose hits are
// Lunar-Charged; Northland Spearstorm, the stance's skill, which waits on a stance's own skill cooldown, so the stance
// Keeps the kit's own skill as Raiden's Musou Isshin does; Cometh the Night's middle hits, which are Lunar-Charged; and
// His passives and constellations, which read the Lunar-Charged reaction or the Manifest Flame's own skill
export const createFlinsKitBehaviour = ({ readParameter, readStance }: KitRecordReader): KitBehaviour => {
  const manifestFlameSeconds = readParameter("manifestFlameSeconds");
  // The Electro strikes are Normal Attack DMG and the charged attack Extra, gcsim's AttackTagNormal and AttackTagExtra in
  // Flins/attack.go and charge.go, so each group takes its kit tag
  const manifestFlame = readStance("manifestFlame");
  return {
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        enterKitStance(kitEffectState, combatant, manifestFlame, manifestFlameSeconds, { isEndedOnSwap: true }),
    },
  };
};
