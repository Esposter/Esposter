import { computeSoundSetResidual } from "#src/services/genshinAssets/sound/computeSoundSetResidual";
import { sumSoundBandPowers } from "#src/services/genshinAssets/sound/sumSoundBandPowers";

interface PlacedSound {
  id: number;
  powers: number[][];
  startFrame: number;
}
// How many frames either side of its start a sound in a set is tried at, each step of the refinement
const REFINE_FRAMES = 4;
const computeResidual = (window: readonly number[][], set: readonly PlacedSound[], bands: readonly number[]): number =>
  computeSoundSetResidual(
    window,
    sumSoundBandPowers(set.map(({ powers, startFrame }) => ({ offsetFrames: startFrame, powers }))),
    bands,
  );
// The candidates played together in every set of them, each set's starts refined from each sound's own best start
// (`findSoundStart`) one sound at a time, a few frames either way, until no move lowers what the set leaves of the
// Window unexplained (`computeSoundSetResidual`). The best set of each size, smallest first, so a reader sees what
// Each further sound buys
export const fitSoundSets = (
  window: readonly number[][],
  candidates: readonly PlacedSound[],
  bands: readonly number[],
): { residual: number; set: PlacedSound[] }[] => {
  const bests: { residual: number; set: PlacedSound[] }[] = [];
  for (let mask = 1; mask < 2 ** candidates.length; mask++) {
    const set = candidates.filter((_candidate, index) => (mask & (1 << index)) !== 0);
    let residual = computeResidual(window, set, bands);
    for (let isMoved = true; isMoved;) {
      isMoved = false;
      for (const [index, sound] of set.entries())
        for (
          let startFrame = Math.max(sound.startFrame - REFINE_FRAMES, 0);
          startFrame <= Math.min(sound.startFrame + REFINE_FRAMES, window.length - 1);
          startFrame++
        ) {
          const trial = set.with(index, { ...sound, startFrame });
          const trialResidual = computeResidual(window, trial, bands);
          if (trialResidual >= residual) continue;
          residual = trialResidual;
          set[index] = { ...sound, startFrame };
          isMoved = true;
        }
    }
    const size = set.length - 1;
    if (residual < (bests[size]?.residual ?? Infinity)) bests[size] = { residual, set };
  }
  return bests;
};
