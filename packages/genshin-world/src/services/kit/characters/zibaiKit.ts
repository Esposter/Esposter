import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { enterKitStance } from "#src/services/kit/effects/enterKitStance";

export const ZIBAI_CHARACTER_ID = 10_000_126;

// Zibai's behaviour: Heaven and Earth Made Manifest enters the Lunar Phase Shift for its record's seconds, at most 15 as
// The wiki gives it, where her normal attacks and charged attack are Geo and her skill is Spirit Steed's Stride. Her
// Strikes outside the shift, her burst and her plunges are her record's alone, and her frames and areas are provisional,
// Read from a Borrowed donor's gcsim hitmarks and areas.
// Not built, each waiting on its own rule: the Phase Shift Radiance that Spirit Steed's Stride costs and the shift gains,
// The Moonsign's Radiance from nearby Lunar-Crystallize, the Moonsign gate on her fourth normal attack, and the second
// Instance of Spirit Steed's Stride as Lunar-Crystallize, which is a Lunar reaction on the hit's record rather than a
// Behaviour.
// Constellation 1 needs Heaven and Earth Made Manifest's effects, which the kit does not build
// Constellation 2 needs the Lunar Phase Shift's effects, which the kit does not build
// Constellation 4 needs the Lunar Phase Shift's effects, which the kit does not build
// Constellation 6 needs the Lunar Phase Shift's effects, which the kit does not build
export const createZibaiKitBehaviour = ({ readParameter, readStance }: KitRecordReader): KitBehaviour => {
  const lunarPhaseShiftSeconds = readParameter("lunarPhaseShiftSeconds");
  const lunarPhaseShift = readStance("lunarPhaseShift");
  const heavenAndEarthMadeManifest: KitActionBehaviour = {
    onStart: ({ activeCombatant: combatant, kitEffectState }) =>
      enterKitStance(kitEffectState, combatant, lunarPhaseShift, lunarPhaseShiftSeconds),
  };
  return { skill: heavenAndEarthMadeManifest };
};
