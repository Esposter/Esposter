import type { SoundStart } from "#src/models/genshinAssets/sound/SoundStart";

import { decodeGameSounds } from "#src/services/genshinAssets/music/decodeGameSounds";
import { readGameMixVolumes } from "#src/services/genshinAssets/music/readGameMixVolumes";
import { SOUND_DIRECTORY, SOUND_SAMPLE_RATE } from "#src/services/genshinAssets/shared/constants";
import { readStereoSamples } from "#src/services/genshinParity/shared/readStereoSamples";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A sound effect as the game plays it: the sounds `genshin:assets sounds` matched, each decoded from the packages a
// Pattern names in both its channels, laid at its offset at `SOUND_SAMPLE_RATE` at the volume the game's mix plays its
// Source at (`readGameMixVolumes`, every bus up to the master's) and the sounds summed; the buses' filters and dynamics
// Are the player's
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
  const mixVolumes = await readGameMixVolumes((_id, { sourceIds }) => sourceIds.some((sourceId) => ids.has(sourceId)));
  const placed = sounds.map(({ id, offsetSeconds }) => {
    const channels = idChannelsMap.get(id);
    if (!channels) throw new InvalidOperationError(Operation.Read, pattern, `holds no sound ${id}`);
    const mixVolume = mixVolumes.find(({ sourceIds }) => sourceIds.includes(id));
    if (!mixVolume) throw new InvalidOperationError(Operation.Read, "sound banks", `play no source ${id}`);
    return { channels, gain: 10 ** (mixVolume.volume / 20), offset: Math.round(offsetSeconds * SOUND_SAMPLE_RATE) };
  });
  const length = Math.max(0, ...placed.map(({ channels: [left], offset }) => offset + left.length));
  const mix: [Float32Array, Float32Array] = [new Float32Array(length), new Float32Array(length)];
  for (const { channels, gain, offset } of placed)
    for (const [channel, samples] of channels.entries()) {
      const output = mix[channel];
      if (output)
        for (const [index, sample] of samples.entries())
          output[offset + index] = (output[offset + index] ?? 0) + gain * sample;
    }
  return mix;
};
