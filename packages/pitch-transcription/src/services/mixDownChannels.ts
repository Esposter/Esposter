import type { AudioChannels } from "#src/models/AudioChannels";

import { AUDIO_SAMPLE_RATE } from "#src/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One channel at the model's sample rate: a `Float32Array` is taken as one already, and a recording of several channels
// Is averaged into one. A recording at any other rate is refused, since resampling is the caller's
export const mixDownChannels = (audio: AudioChannels | Float32Array): Float32Array => {
  if (audio instanceof Float32Array) return audio;
  if (audio.sampleRate !== AUDIO_SAMPLE_RATE)
    throw new InvalidOperationError(
      Operation.Read,
      mixDownChannels.name,
      `audio at ${audio.sampleRate} Hz, the model reads ${AUDIO_SAMPLE_RATE} Hz`,
    );
  if (audio.numberOfChannels === 1) return audio.getChannelData(0);
  const mixed = new Float32Array(audio.getChannelData(0).length);
  for (let channel = 0; channel < audio.numberOfChannels; channel++)
    for (const [index, sample] of audio.getChannelData(channel).entries())
      mixed[index] = (mixed[index] ?? 0) + sample / audio.numberOfChannels;
  return mixed;
};
