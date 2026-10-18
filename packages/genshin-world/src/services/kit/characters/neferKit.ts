import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { enterKitStance } from "#src/services/kit/effects/enterKitStance";

export const NEFER_CHARACTER_ID = 10_000_122;

// Nefer's behaviour: Senet Strategy: Dance of a Thousand Nights enters Shadow Dance for her record's seconds, where her
// Charged Attack is Phantasm Performance, a stance of its own seven hits. Her strikes, skill hits, plunges and burst's hits
// Are her record's alone, and her frames and areas are provisional, read from Borrowed donors' gcsim hitmarks and areas.
// Not built, each waiting on its own rule: the Verdant Dew a Phantasm Performance needs and spends, the three Phantasm
// Performances that end the state, the burst's use of her charges, Constellation 1's Lunar-Bloom base DMG, Constellation
// 2 needs the Ascension talent A Wager of Moonlight's Veil of Falsehood, which the kit does not build, Constellation 4
// Needs the Shadow Dance Charged Attack with Verdant Dew, and Constellation 6 needs the Shadow Dance Charged Attack and
// Phantasm Performance
export const createNeferKitBehaviour = ({ readParameter, readStance }: KitRecordReader): KitBehaviour => {
  const shadowDanceSeconds = readParameter("shadowDanceSeconds");
  const phantasmPerformance = readStance("phantasmPerformance");
  const shadowDance: KitActionBehaviour = {
    onStart: ({ activeCombatant: combatant, kitEffectState }) =>
      enterKitStance(kitEffectState, combatant, phantasmPerformance, shadowDanceSeconds),
  };
  return { skill: shadowDance };
};
