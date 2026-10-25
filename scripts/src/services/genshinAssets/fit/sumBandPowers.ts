import type { StereoSoundBandPowers } from "#src/models/genshinAssets/sound/StereoSoundBandPowers";

// Each band's power over every frame, both channels' own and the shared counted in each channel
export const sumBandPowers = ({ left, right, shared }: StereoSoundBandPowers): number[] =>
  shared.reduce<number[]>(
    (sums, bands, frame) =>
      bands.map(
        (power, band) => (sums[band] ?? 0) + 2 * power + (left[frame]?.[band] ?? 0) + (right[frame]?.[band] ?? 0),
      ),
    [],
  );
