// How far under the window's loudest a band's level is still read, in decibels: below it, the recording's own noise
// And what the baseline left behind outweigh the sound
const WINDOW_RANGE_DECIBELS = 30;
// How far under the model's loudest its level is floored, so a band it leaves silent reads as far off rather than
// Infinitely
const MODEL_FLOOR_DECIBELS = 60;
// How much of a recording's window a model of it leaves unexplained, in decibels: each band's level against the
// Model's over the frames the window sounds in, the one gain that best lines them up taken out, since a recording's
// Level is not the game's, and the root mean square of what remains; a model silent over the window explains none of
// It. The gain is one over every band, never one a band: the game's sounds keep their own balance, and a gain a band
// Would let one sound stand in for another's octaves
export const computeSoundSetResidual = (
  window: readonly number[][],
  model: readonly number[][],
  bands: readonly number[],
): number => {
  const windowPeak = Math.max(0, ...window.flatMap((frameBands) => bands.map((band) => frameBands[band] ?? 0)));
  const modelPeak = Math.max(
    0,
    ...model.slice(0, window.length).flatMap((frameBands) => bands.map((band) => frameBands[band] ?? 0)),
  );
  if (modelPeak === 0) return Infinity;
  const windowFloor = windowPeak * 10 ** (-WINDOW_RANGE_DECIBELS / 10);
  const modelFloor = modelPeak * 10 ** (-MODEL_FLOOR_DECIBELS / 10);
  const differences = window.flatMap((frameBands, frame) =>
    bands.flatMap((band) => {
      const power = frameBands[band] ?? 0;
      return power > windowFloor && power > 0
        ? [10 * Math.log10(power / Math.max(model[frame]?.[band] ?? 0, modelFloor))]
        : [];
    }),
  );
  if (differences.length === 0) return 0;
  const gain = differences.reduce((sum, difference) => sum + difference, 0) / differences.length;
  return Math.sqrt(differences.reduce((sum, difference) => sum + (difference - gain) ** 2, 0) / differences.length);
};
