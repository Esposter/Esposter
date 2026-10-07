import { decodeGameSounds } from "#src/services/genshinAssets/music/decodeGameSounds";
import { SOUND_DIRECTORY, SOUND_SAMPLE_RATE } from "#src/services/genshinAssets/shared/constants";
import { computeSoundBandPowers } from "#src/services/genshinAssets/sound/computeSoundBandPowers";
import { readAudioSamples } from "#src/services/genshinParity/shared/readAudioSamples";

// Each sound a filter keeps of the audio packages a pattern names, by its id, as its octave bands' powers frame by
// Frame (`computeSoundBandPowers`), decoded once into `SOUND_DIRECTORY` and kept there
export const readGameSoundBandPowers = async (
  pattern: string,
  filter: (id: number) => boolean,
): Promise<Map<number, number[][]>> => {
  const soundBandPowersMap = new Map<number, number[][]>();
  // oxlint-disable-next-line no-await-in-loop -- each sound is read as it is decoded
  for await (const { id, path } of decodeGameSounds(pattern, filter, SOUND_DIRECTORY))
    // oxlint-disable-next-line no-await-in-loop -- as above
    soundBandPowersMap.set(id, computeSoundBandPowers(await readAudioSamples(path, SOUND_SAMPLE_RATE)));
  return soundBandPowersMap;
};
