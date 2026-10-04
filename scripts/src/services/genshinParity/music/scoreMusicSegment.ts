import type { MusicScore } from "#src/models/genshinParity/music/MusicScore";

import { computeMean } from "#src/services/genshinAssets/shared/computeMean";
import { computeAudibleFrames } from "#src/services/genshinParity/music/computeAudibleFrames";
import { computeBandGaps } from "#src/services/genshinParity/music/computeBandGaps";
import { computeBandLevels } from "#src/services/genshinParity/music/computeBandLevels";
import { computeChroma } from "#src/services/genshinParity/music/computeChroma";
import { computeChromaAgreement } from "#src/services/genshinParity/music/computeChromaAgreement";

// How close our render of a segment of music sounds to the game's, over the frames the game's sound is not quiet in.
// Its pitch agreement is the mean dot product of the two's pitch classes, 1 when every frame names the same notes in
// The same balance. Its distance is, for each octave band, the mean gap between the two's levels in decibels, which
// Charges a timbre's balance and a loudness alike, a level far under the game's loudest in its band read as that floor
// So a band quiet on both sides costs nothing, and the mean of the bands. Each band's bias is the same gap signed,
// Which tells a band ours leaves short from one it overfills
export const scoreMusicSegment = (ours: Float32Array, game: Float32Array, sampleRate: number): MusicScore => {
  const length = Math.min(ours.length, game.length);
  const ourSamples = ours.subarray(0, length);
  const gameSamples = game.subarray(0, length);
  const ourChroma = computeChroma(ourSamples, sampleRate);
  const gameChroma = computeChroma(gameSamples, sampleRate);
  const loudFrames = computeAudibleFrames(gameChroma.loudness);
  const bandGaps = computeBandLevels(ourSamples, gameSamples, sampleRate, loudFrames).map((levels) =>
    computeBandGaps(levels, 0),
  );
  const bandDistances = bandGaps.map((gaps) => computeMean(gaps.map((gap) => Math.abs(gap))));
  return {
    bandBiases: bandGaps.map((gaps) => computeMean(gaps)),
    bandDistances,
    distance: computeMean(bandDistances),
    pitchAgreement: computeChromaAgreement(ourChroma.classes, gameChroma.classes, loudFrames, 0),
  };
};
