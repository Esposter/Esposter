import { fitMusicVoices } from "#src/services/genshinAssets/shared/fitMusicVoices";
import { readMusicSourceNotes } from "#src/services/genshinAssets/shared/readMusicSourceNotes";
import { readAudioSamples } from "#src/services/genshinParity/shared/readAudioSamples";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

// A source's decoded samples and its notes, with the voices those notes split into and each voice's instrument fitted
export const fitMusicSource = async (
  wavePath: string,
): Promise<
  ReturnType<typeof fitMusicVoices> & { notes: Awaited<ReturnType<typeof readMusicSourceNotes>>; samples: Float32Array }
> => {
  const samples = await readAudioSamples(wavePath, AUDIO_SAMPLE_RATE);
  const notes = await readMusicSourceNotes(wavePath, samples);
  return { notes, samples, ...fitMusicVoices(samples, notes) };
};
