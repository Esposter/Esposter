import type { PlacedSound } from "#src/models/genshinAssets/sound/PlacedSound";

import { computeSoundSetResidual } from "#src/services/genshinAssets/sound/computeSoundSetResidual";
import { sumSoundBandPowers } from "#src/services/genshinAssets/sound/sumSoundBandPowers";

export const computeResidual = (
  window: readonly number[][],
  set: readonly PlacedSound[],
  bands: readonly number[],
): number =>
  computeSoundSetResidual(
    window,
    sumSoundBandPowers(set.map(({ powers, startFrame }) => ({ offsetFrames: startFrame, powers }))),
    bands,
  );
