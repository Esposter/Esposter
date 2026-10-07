import type { SoundStart } from "#src/models/genshinAssets/sound/SoundStart";

import { decodeGameSounds } from "#src/services/genshinAssets/music/decodeGameSounds";
import { SOUND_DIRECTORY, SOUND_SAMPLE_RATE } from "#src/services/genshinAssets/shared/constants";
import { readStereoSamples } from "#src/services/genshinParity/shared/readStereoSamples";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A sound effect as the game plays it: the sounds `genshin:assets sounds` matched, each decoded from the packages a
// Pattern names in both its channels, laid at its offset at `SOUND_SAMPLE_RATE` and the sounds summed
export const readGameSoundEffect = async (
  pattern: string,
  sounds: readonly SoundStart[],
): Promise<[Float32Array, Float32Array]> => {
  const ids = new Set(sounds.map(({ id }) => id));
  const idChannelsMap = new Map<number, [Float32Array, Float32Array]>();
  // oxlint-disable-next-line no-await-in-loop -- each sound is read as it is decoded
  for await (const { id, path } of decodeGameSounds(pattern, (soundId) => ids.has(soundId), SOUND_DIRECTORY))
    // oxlint-disable-next-line no-await-in-loop -- as above
    idChannelsMap.set(id, await readStereoSamples(path, SOUND_SAMPLE_RATE));
  const placed = sounds.map(({ id, offsetSeconds }) => {
    const channels = idChannelsMap.get(id);
    if (!channels) throw new InvalidOperationError(Operation.Read, pattern, `holds no sound ${id}`);
    return { channels, offset: Math.round(offsetSeconds * SOUND_SAMPLE_RATE) };
  });
  const length = Math.max(0, ...placed.map(({ channels: [left], offset }) => offset + left.length));
  const mix: [Float32Array, Float32Array] = [new Float32Array(length), new Float32Array(length)];
  for (const { channels, offset } of placed)
    for (const [channel, samples] of channels.entries()) {
      const output = mix[channel];
      if (output)
        for (const [index, sample] of samples.entries())
          output[offset + index] = (output[offset + index] ?? 0) + sample;
    }
  return mix;
};
