import { computeStereoSoundBandPowers } from "#src/services/genshinAssets/sound/computeStereoSoundBandPowers";
import { toDecibels } from "#src/services/genshinParity/shared/toDecibels";
import { SOUND_POWER_FLOOR, SOUND_SCORE_HOP_LENGTH } from "#src/services/genshinParity/sound/constants";

// Each channel's level in each band frame by frame, its own power and the shared one's together
export const computeChannelLevels = (left: Float32Array, right: Float32Array): number[][][] => {
  const powers = computeStereoSoundBandPowers(left, right, SOUND_SCORE_HOP_LENGTH);
  return [powers.left, powers.right].map((frames) =>
    frames.map((bands, frame) =>
      bands.map((power, band) => toDecibels(power + (powers.shared[frame]?.[band] ?? 0), SOUND_POWER_FLOOR)),
    ),
  );
};
