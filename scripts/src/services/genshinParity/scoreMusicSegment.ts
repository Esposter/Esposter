import type { MusicScore } from "#src/models/genshinParity/MusicScore";

import { computeChroma } from "#src/services/genshinParity/computeChroma";
import { readAudibleFrames } from "#src/services/genshinParity/readAudibleFrames";
import { readBandEnergies } from "#src/services/genshinParity/readBandEnergies";
import { readBandFloor } from "#src/services/genshinParity/readBandFloor";

const mean = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
// How close our render of a segment of music sounds to the game's, over the frames the game's sound is not quiet in.
// Its pitch agreement is the mean dot product of the two's pitch classes, 1 when every frame names the same notes in
// The same balance. Its distance is, for each octave band, the mean gap between the two's levels in decibels, which
// Charges a timbre's balance and a loudness alike, a level far under the game's loudest in its band read as that floor
// So a band quiet on both sides costs nothing, and the mean of the bands. Each band's bias is the same gap signed, which
// Tells a band ours leaves short from one it overfills
export const scoreMusicSegment = (ours: Float32Array, game: Float32Array, sampleRate: number): MusicScore => {
  const length = Math.min(ours.length, game.length);
  const ourSamples = ours.subarray(0, length);
  const gameSamples = game.subarray(0, length);
  const ourChroma = computeChroma(ourSamples, sampleRate);
  const gameChroma = computeChroma(gameSamples, sampleRate);
  const loudFrames = readAudibleFrames(gameChroma.loudness);
  let agreement = 0;
  for (const frame of loudFrames)
    for (let pitchClass = 0; pitchClass < 12; pitchClass++)
      agreement +=
        (ourChroma.classes[frame * 12 + pitchClass] ?? 0) * (gameChroma.classes[frame * 12 + pitchClass] ?? 0);
  const ourBands = readBandEnergies(ourSamples, sampleRate);
  const gameBands = readBandEnergies(gameSamples, sampleRate);
  const bandGaps = gameBands.map((gameEnergies, band) => {
    const ourEnergies = ourBands[band] ?? new Float64Array();
    const floor = readBandFloor(gameEnergies);
    return loudFrames.map(
      (frame) => 10 * Math.log10(Math.max(ourEnergies[frame] ?? 0, floor) / Math.max(gameEnergies[frame] ?? 0, floor)),
    );
  });
  const bandDistances = bandGaps.map((gaps) => mean(gaps.map((gap) => Math.abs(gap))));
  return {
    bandBiases: bandGaps.map((gaps) => mean(gaps)),
    bandDistances,
    distance: bandDistances.reduce((sum, distance) => sum + distance, 0) / bandDistances.length,
    pitchAgreement: agreement / Math.max(loudFrames.length, 1),
  };
};
