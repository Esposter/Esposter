import type { SoundStart } from "#src/models/genshinAssets/sound/SoundStart";
import type { StereoSoundBandPowers } from "#src/models/genshinAssets/sound/StereoSoundBandPowers";
import type { SoundEffect } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { SOUND_HOP_LENGTH, SOUND_SAMPLE_RATE } from "#src/services/genshinAssets/shared/constants";
import { computeStereoSoundBandPowers } from "#src/services/genshinAssets/sound/computeStereoSoundBandPowers";
import { readGameSoundEffect } from "#src/services/genshinAssets/sound/readGameSoundEffect";
import { computeSoundEffectSamples } from "genshin-engine";

// A level is kept to five decimals, a hundred decibels under the loudest a sample holds, where the sound has died
// Away; the effect ends at the last frame any of its noises holds above none
const LEVEL_DECIMALS = 5;
// Each band's power over every frame, both channels' own and the shared counted in each channel
const sumBandPowers = ({ left, right, shared }: StereoSoundBandPowers): number[] =>
  shared.reduce<number[]>(
    (sums, bands, frame) =>
      bands.map(
        (power, band) => (sums[band] ?? 0) + 2 * power + (left[frame]?.[band] ?? 0) + (right[frame]?.[band] ?? 0),
      ),
    [],
  );
const toLevels = (frames: number[][], bandGains: number[]): number[][] =>
  frames.map((bands) => bands.map((power, band) => Math.sqrt(power * (bandGains[band] ?? 1))));
// A sound effect as noise of our own, from the game's sounds `genshin:assets sounds` matched: the sounds laid at their
// Offsets in both channels as the game plays them (`readGameSoundEffect`), and the mix's powers read band by band and
// Frame by frame as the shared noise and each channel's own (`computeStereoSoundBandPowers`), a level the root of its
// Power. A window reads a band of few bins short of what the engine's noise plays in it, so the levels are rendered
// Once, read back as the game's were, and each band scaled by the game's power over the render's across the whole
// Effect: the render is the same every time, so what is scaled is what plays. Only the levels ship, never a sample of
// The game's
export const fitSoundEffect = async (pattern: string, sounds: readonly SoundStart[]): Promise<SoundEffect> => {
  const [left, right] = await readGameSoundEffect(pattern, sounds);
  const powers = computeStereoSoundBandPowers(left, right);
  const measured: SoundEffect = {
    frameSeconds: SOUND_HOP_LENGTH / SOUND_SAMPLE_RATE,
    leftLevels: toLevels(powers.left, []),
    rightLevels: toLevels(powers.right, []),
    sharedLevels: toLevels(powers.shared, []),
  };
  const gameBandPowers = sumBandPowers(powers);
  const renderedBandPowers = sumBandPowers(
    computeStereoSoundBandPowers(...computeSoundEffectSamples(measured, SOUND_SAMPLE_RATE)),
  );
  const bandGains = gameBandPowers.map((power, band) => {
    const rendered = renderedBandPowers[band] ?? 0;
    return rendered > 0 ? power / rendered : 1;
  });
  const [leftLevels, rightLevels, sharedLevels] = [powers.left, powers.right, powers.shared].map((frames) =>
    toLevels(frames, bandGains).map((bands) => bands.map((level) => roundFitted(level, LEVEL_DECIMALS))),
  );
  const lastSounding = Math.max(
    ...[leftLevels, rightLevels, sharedLevels].map((frames = []) =>
      frames.findLastIndex((bands) => bands.some((level) => level > 0)),
    ),
  );
  return {
    frameSeconds: SOUND_HOP_LENGTH / SOUND_SAMPLE_RATE,
    leftLevels: leftLevels?.slice(0, lastSounding + 1) ?? [],
    rightLevels: rightLevels?.slice(0, lastSounding + 1) ?? [],
    sharedLevels: sharedLevels?.slice(0, lastSounding + 1) ?? [],
  };
};
