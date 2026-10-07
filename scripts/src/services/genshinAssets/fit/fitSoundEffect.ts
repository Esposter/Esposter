import type { SoundStart } from "#src/models/genshinAssets/sound/SoundStart";
import type { SoundEffect } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { SOUND_HOP_LENGTH, SOUND_SAMPLE_RATE } from "#src/services/genshinAssets/shared/constants";
import { readGameSoundBandPowers } from "#src/services/genshinAssets/sound/readGameSoundBandPowers";
import { sumSoundBandPowers } from "#src/services/genshinAssets/sound/sumSoundBandPowers";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A level is kept to five decimals, a hundred decibels under the loudest a sample holds, where the sound has died
// Away; the effect ends at the last frame any band holds above none
const LEVEL_DECIMALS = 5;
// A sound effect as noise of our own, from the game's sounds `genshin:assets sounds` matched: each decoded from the
// Packages a pattern names, its power in each octave band read frame by frame (`computeSoundBandPowers`), and the
// Sounds summed at their offsets, each at the level it is stored at, a band's level the root of its power. Only the
// Levels ship, never a sample of the game's
export const fitSoundEffect = async (pattern: string, sounds: readonly SoundStart[]): Promise<SoundEffect> => {
  const ids = new Set(sounds.map(({ id }) => id));
  const soundBandPowersMap = await readGameSoundBandPowers(pattern, (id) => ids.has(id));
  const powers = sumSoundBandPowers(
    sounds.map(({ id, offsetSeconds }) => {
      const soundPowers = soundBandPowersMap.get(id);
      if (!soundPowers) throw new InvalidOperationError(Operation.Read, pattern, `holds no sound ${id}`);
      return { offsetFrames: Math.round((offsetSeconds * SOUND_SAMPLE_RATE) / SOUND_HOP_LENGTH), powers: soundPowers };
    }),
  );
  const levels = powers.map((bands) => bands.map((power) => roundFitted(Math.sqrt(power), LEVEL_DECIMALS)));
  const lastSounding = levels.findLastIndex((bands) => bands.some((level) => level > 0));
  return { frameSeconds: SOUND_HOP_LENGTH / SOUND_SAMPLE_RATE, levels: levels.slice(0, lastSounding + 1) };
};
