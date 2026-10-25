import type { Instrument } from "genshin-engine";
import type { Except } from "type-fest";

import { roundMusic } from "#src/services/genshinAssets/shared/roundMusic";

// A fitted instrument as `music.json` holds it, with no recordings yet: the solve that layers them over it is run
// Against our render of it afterwards (`genshin:parity instruments`)
export const roundInstrument = ({
  attack,
  decay,
  harmonics,
  level,
  noiseBands,
  release,
  sustain,
  tuning,
}: Except<Instrument, "recordingLevel" | "recordings">): Instrument => ({
  attack: roundMusic(attack),
  decay: roundMusic(decay),
  harmonics: harmonics.map((harmonic) => roundMusic(harmonic)),
  level: roundMusic(level),
  noiseBands: noiseBands.map((noiseBand) => roundMusic(noiseBand)),
  recordingLevel: 0,
  recordings: [],
  release: roundMusic(release),
  sustain: roundMusic(sustain),
  tuning: roundMusic(tuning),
});
