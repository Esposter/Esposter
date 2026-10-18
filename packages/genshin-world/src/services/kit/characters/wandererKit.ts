import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { enterKitStance } from "#src/services/kit/effects/enterKitStance";

export const WANDERER_CHARACTER_ID = 10_000_075;

// Wanderer's behaviour: Hanega: Song of the Wind enters Windfavored for as long as its skydweller points last, whose
// Strikes and charged attack take the skill's bonus and whose burst plays its fall. Not built yet: his Dash and Jump while
// Windfavored, which hold the skydweller points' drain, the swap lock on his skill, his Ascension and Constellation
// Passives
// Constellation 1 needs an Attack SPD bonus on Kuugo: Fushoudan and Kuugo: Toufukai, which no attribute carries
// Constellation 2 needs the skydweller points, which the kit does not drain or track
// Constellation 4 needs the Jade-Claimed Flower's extra buff, which the kit does not build
// Constellation 6 needs the extra Kuugo: Fushoudan instance on each hit, which the kit does not build
export const createWandererKitBehaviour = ({ readSeconds, readStance }: KitRecordReader): KitBehaviour => {
  const windfavoredSeconds = readSeconds("windfavored");
  // The Windfavored strikes and charged attack are Normal and Charged Attack DMG, gcsim's AttackTagNormal in
  // Wanderer/attack.go's WindfavoredAttack and AttackTagExtra in wanderer/charge.go's WindfavoredChargeAttack
  const windfavored = readStance("windfavored");
  return {
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        enterKitStance(kitEffectState, combatant, windfavored, windfavoredSeconds),
    },
  };
};
